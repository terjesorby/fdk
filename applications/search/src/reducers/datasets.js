import _ from 'lodash';
import { DATASETS_REQUEST, DATASETS_SUCCESS, DATASETS_FAILURE } from '../constants/ActionTypes';

export default function datasets(state = { isFetchingDatasets: false, datasetItems: null, publisherCountItems: null }, action) {
  switch (action.type) {
    case DATASETS_REQUEST: {
      return {
        ...state,
        isFetchingDatasets: true
      };
    }
    case DATASETS_SUCCESS: {
      const orgs = action.response.data.aggregations.orgPath.buckets;
      const flat = _(orgs).forEach( f => {
        const filteredOrgs = _(orgs).filter( g => g.key.substring(0, g.key.lastIndexOf('/')) === f.key).value();
        filteredOrgs.forEach( item => {
          const retVal = item;
          retVal.hasParent = true;
          return retVal;
        })
        const retVal = f;
        retVal.children= filteredOrgs;
        return retVal;
      });
      const resultArray = _(flat).filter( f => !f.hasParent).value();
      return {
        ...state,
        isFetchingDatasets: false,
        datasetItems: action.response.data,
        publisherCountItems: resultArray
      }
    }
    case DATASETS_FAILURE: {
      return {
        ...state,
        isFetchingDatasets: false,
        datasetItems: null,
        publisherCountItems: null
      };
    }
    default:
      return state;
  }
}
