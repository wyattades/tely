import React, { useRef, useState, useEffect, useCallback } from 'react';

import { ContainerSection, Spinner } from './misc';
import * as db from '../db';
import { ListView } from './MediaLists';
import services from '../services';
import { useWindowEvent, useQueryParam } from '../hooks';

const RESULT_COUNT = 21;

const getLists = async ({ sort, filter, lastDoc }) => {
  let query = db.lists.limit(RESULT_COUNT).where('is_public', '==', true);

  if (filter) query = query.where('type', '==', filter);

  if (sort === 'new') query = query.orderBy('created');
  else if (sort === 'modified') query = query.orderBy('modified', 'desc');
  else query = query.orderBy('popularity', 'desc');

  if (lastDoc) query = query.startAfter(lastDoc);

  const snap = await query.get();

  const lists = [];
  for (const item of snap.docs) {
    const itemData = item.data();
    itemData.id = item.id;
    lists.push(itemData);
  }

  return [lists, snap.docs[snap.size - 1] || null];
};

const Browse = () => {
  const [lists, setLists] = useState(null);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useQueryParam('filter');
  const [sort, setSort] = useQueryParam('sort');
  const lastDoc = useRef(null);
  const containerRef = useRef();

  const fetchLists = useCallback(async ({ sort, filter }) => {
    try {
      const [newLists, newLastDoc] = await getLists({
        sort,
        filter,
        lastDoc: lastDoc.current,
      });

      setLists((current) => {
        const next =
          current && lastDoc.current ? current.concat(newLists) : newLists;

        lastDoc.current = next.length >= RESULT_COUNT ? newLastDoc : null;

        return next;
      });

      // onScroll();
    } catch (err) {
      console.error(err);
      setError(err?.code || 500);
    }
  }, []);

  useWindowEvent('scroll', () => {
    if (
      lastDoc.current &&
      containerRef.current &&
      containerRef.current.getBoundingClientRect().bottom < window.innerHeight
    ) {
      fetchLists({ sort, filter });
    }
  });

  useEffect(() => {
    lastDoc.current = null;
    setLists(null);
    setError(null);

    fetchLists({ sort, filter });
  }, [fetchLists, sort, filter]);

  const changeFilter = (e) => setFilter(e.target.value || null);
  const changeSort = (e) => setSort(e.target.value || null);

  let amount = null;
  if (error) {
    amount = <p className="has-text-danger">Error: {error}</p>;
  } else if (lists) {
    const len = lists.length;
    amount = (
      <p className="has-text-grey">
        {len || 'No'} Result{len === 1 ? '' : 's'}
        {len < RESULT_COUNT ? ' Found' : ' Shown'}
      </p>
    );
  }

  return (
    <ContainerSection>
      <h1 className="is-size-1">Browse</h1>
      <p className="is-size-5 has-text-grey">Public Lists</p>
      <br />
      <div className="level">
        <div className="level-left">
          <div className="level-item">{amount}</div>
        </div>
        <div className="level-right">
          <div className="level-item">
            <div className="field has-addons">
              <div className="control">
                <a className="button is-static">Filter by</a>
              </div>
              <div className="control">
                <div className="select">
                  <select value={filter || ''} onChange={changeFilter}>
                    <option value="">-</option>
                    {services.map(({ ID, LABEL }) => (
                      <option key={ID} value={ID}>
                        {LABEL}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="level-item">
            <div className="field has-addons">
              <div className="control">
                <a className="button is-static">Sort by</a>
              </div>
              <div className="control">
                <div className="select">
                  <select value={sort || ''} onChange={changeSort}>
                    <option value="">Popularity</option>
                    <option value="new">Newest</option>
                    <option value="modified">Last Modified</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {lists ? (
        <div className="columns is-multiline" ref={containerRef}>
          {lists.map((props) => (
            <div key={props.id} className="column is-one-third">
              <ListView {...props} />
            </div>
          ))}
        </div>
      ) : (
        <>
          <br />
          <br />
          <br />
          <Spinner centered />
        </>
      )}
    </ContainerSection>
  );
};

export default Browse;
