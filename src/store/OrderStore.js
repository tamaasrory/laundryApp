/**
 * @flow strict-local
 */
import {action, computed, observable} from 'mobx';

class OrderStore {
  @observable data = [];

  @action setData = data => {
    this.data = data;
  };

  @computed get getData() {
    return this.data;
  }
}

export default new OrderStore();
