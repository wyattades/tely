import { IDENTITY } from '../empty';

export class BaseService {
  ID = null;
  LABEL = null;
  DESCRIPTION = null;
  CLASS = null;
  ICON = null;

  async init() {}

  renderBody() {
    return null;
  }

  renderText() {
    return '';
  }

  mapResponse = IDENTITY;

  async search(_str) {
    return [];
  }

  async suggest(_list) {
    return [];
  }
}
