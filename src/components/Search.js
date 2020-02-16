import React, { useState, useEffect, useRef } from 'react';

import { roleClick } from '../utils';
import { servicesMap } from '../services';
import { useQueryParam, useDebounce } from '../hooks';

const SEARCH_DELAY = 1000;

const Search = ({ type, results, setResults }) => {
  const [searchParam, setSearchParam] = useQueryParam('search');
  const [searchValue, setSearchValue] = useState(searchParam || '');
  const [searching, setSearching] = useState(false);
  const [resultCount, setResultCount] = useState(
    results ? results.length : null,
  );
  const [error, setError] = useState(null);

  const media = servicesMap[type];

  useEffect(() => {
    if (searchParam) {
      setSearching(true);

      media
        .search(searchParam)
        .then((results) => {
          setSearching(false);
          setResults(results.length ? results : null);
          setResultCount(results.length);
        })
        .catch((err) => {
          setSearching(false);
          setError(err);
          console.error(err);
        });
    } else {
      setResults(null);
      setResultCount(null);
    }
  }, [searchParam, media, setResults]);

  const delayedSearchValue = useDebounce(searchValue, SEARCH_DELAY);
  const latestSetSearchParam = useRef(setSearchParam);
  latestSetSearchParam.current = setSearchParam;
  useEffect(() => {
    latestSetSearchParam.current(delayedSearchValue || null);
  }, [delayedSearchValue]);

  const handleChange = (event) => {
    const searchValue = event.target.value || '';
    setSearchValue(searchValue);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    setSearchParam(searchValue || null);
  };

  const clearSearch = () => {
    setSearchValue('');
    setSearchParam(null);
    setResults(null);
    setResultCount(null);
  };

  if (error) throw error;
  if (!media) throw `Invalid list type: ${type}`;

  let Side = null;
  if (searching)
    Side = (
      <span className="icon is-large is-right">
        <i className="fas fa-circle-notch fa-spin" />
      </span>
    );
  else if (resultCount != null)
    Side = (
      <span
        className="icon is-large is-right icon-clickable"
        onClick={clearSearch}
        role="button"
        tabIndex="0"
        onKeyPress={roleClick}
        aria-label="Clear search"
      >
        <i className="fas fa-times-circle" />
      </span>
    );

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="field has-addons">
          <div className="control has-icons-right is-expanded">
            <input
              className={`input ${resultCount === 0 && 'is-danger'}`}
              type="text"
              value={searchValue}
              onChange={handleChange}
              placeholder={`Add ${media.LABEL}`}
            />
            {Side}
          </div>
          <div className="control">
            <button type="submit" className="button is-primary">
              Search
            </button>
          </div>
        </div>
      </form>
      <br />
      {resultCount != null && (
        <p className="has-text-grey has-text-centered">{resultCount} Results</p>
      )}
    </>
  );
};

export default Search;
