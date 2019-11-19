import React, { useState } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import noop from 'lodash/noop';
import cx from 'classnames';
import Autocomplete from 'react-autocomplete';

const renderInput = props => (
  <div className="input-group">
    <input type="text" className="form-control" {...props} />
    <span className="input-group-btn input-group-append" />
  </div>
);

const shouldItemRender = (item, value) =>
  get(item, 'name', '')
    .toLowerCase()
    .indexOf(value.toLowerCase()) > -1;

const getItemValue = item => get(item, 'norwegianRegistry', '');

const renderItem = (item, isHighlighted) => {
  const itemClass = cx('px-2', {
    'fdk-bg-color-neutral-lightest': isHighlighted
  });
  return (
    <div key={item.norwegianRegistry} className={itemClass}>
      {get(item, 'name', '')}
    </div>
  );
};

const renderMenu = (items, value, style) => (
  <div className="fdk-autocomplete-menu" style={{ ...style }}>
    {items.slice(0, 50)}
  </div>
);

export const SearchPublisherPure = ({ suggestions, onChosenPublisher }) => {
  const [searchText, setSearchText] = useState('');

  const selectSuggestion = item => {
    setSearchText(item.name);
    onChosenPublisher({
      uri: item.norwegianRegistry,
      name: item.name
    });
  };

  return (
    <div className="position-relative w-75">
      <Autocomplete
        wrapperProps={{ style: { width: '100%' } }}
        items={suggestions}
        value={searchText}
        renderInput={props => renderInput(props)}
        shouldItemRender={(item, value) => shouldItemRender(item, value)}
        getItemValue={item => getItemValue(item)}
        renderItem={(item, isHighlighted) => renderItem(item, isHighlighted)}
        renderMenu={(items, value, style) => renderMenu(items, value, style)}
        menuStyle={{ zIndex: '1000' }}
        onChange={e => {
          setSearchText(e.target.value);
        }}
        onSelect={(value, item) => selectSuggestion(item)}
      />

      <i
        className="fa fa-search"
        style={{
          position: 'absolute',
          right: '2%',
          top: '12px',
          zIndex: '1050'
        }}
      />
    </div>
  );
};

SearchPublisherPure.defaultProps = {
  suggestions: null,
  onChosenPublisher: noop()
};

SearchPublisherPure.propTypes = {
  suggestions: PropTypes.array,
  onChosenPublisher: PropTypes.func
};