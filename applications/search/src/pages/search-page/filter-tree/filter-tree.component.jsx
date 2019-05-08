import React from 'react';
import PropTypes from 'prop-types';
import TreeView from 'react-treeview';
import cx from 'classnames';
import { Collapse } from 'reactstrap';
import _ from 'lodash';

import { FilterOption } from '../../../components/filter-option/filter-option.component';
import localization from '../../../lib/localization';
import { getTranslateText } from '../../../lib/translateText';
import './filter-tree.scss';
import { keyPrefixForest } from '../../../lib/key-prefix-forest';

const isItemCollapsed = (itemOrgPath, chosenOrgPath) => {
  if (chosenOrgPath && chosenOrgPath !== undefined) {
    const parentOrgPath = chosenOrgPath.substr(
      0,
      chosenOrgPath.lastIndexOf('/')
    );
    if (parentOrgPath.indexOf(itemOrgPath) !== -1) {
      return false;
    }
  }
  return true;
};

const hasSomeChildren = node =>
  node && Array.isArray(node.children) && node.children.length > 0;
const hasSomeSiblingChildren = siblings =>
  Array.isArray(siblings) && siblings.some(hasSomeChildren);

const isActiveFilter = (activeFilter, key) =>
  !!activeFilter && activeFilter.split(',').includes(key);

const subTree = ({
  aggregations,
  activeFilter,
  referenceDataItems,
  handleFiltering
}) =>
  aggregations.map((node, i) => {
    const name =
      getTranslateText(_.get(referenceDataItems, [node.key, 'prefLabel'])) ||
      _.capitalize(_.get(referenceDataItems, [node.key, 'name'], node.key));

    const label = (
      <FilterOption
        key={`${node.key}|${i}`}
        itemKey={0.5}
        value={node.key}
        labelRaw={name}
        count={node.count}
        onClick={handleFiltering}
        active={isActiveFilter(activeFilter, node.key)}
        displayClass={hasSomeChildren(node) ? 'inline-block' : ''}
      />
    );
    const collapsed = isItemCollapsed(node.key, activeFilter);
    if (hasSomeChildren(node)) {
      return (
        <TreeView
          key={`${node.key}|${i}`}
          nodeLabel={label}
          defaultCollapsed={collapsed}
        >
          {subTree({
            aggregations: node.children,
            activeFilter,
            referenceDataItems,
            handleFiltering
          })}
        </TreeView>
      );
    }
    return (
      <FilterOption
        key={`${node.key}|${i}`}
        itemKey={0.5}
        value={node.key}
        labelRaw={name}
        count={node.count}
        onClick={handleFiltering}
        active={isActiveFilter(activeFilter, node.key)}
        displayClass={hasSomeSiblingChildren(aggregations) ? 'indent' : ''}
      />
    );
  });

const mainTree = ({
  aggregationsForest,
  activeFilter,
  referenceDataItems,
  handleFiltering
}) =>
  Array.isArray(aggregationsForest) &&
  aggregationsForest.map((node, i) => {
    const collapsed = isItemCollapsed(node.key, activeFilter);

    let name = node.key;
    if (referenceDataItems) {
      const currentPublisher = referenceDataItems[node.key];
      if (
        currentPublisher &&
        (currentPublisher.id === 'STAT' ||
          currentPublisher.id === 'FYLKE' ||
          currentPublisher.id === 'KOMMUNE' ||
          currentPublisher.id === 'PRIVAT' ||
          currentPublisher.id === 'ANNET')
      ) {
        name = localization.facet.publishers[currentPublisher.name];
      } else if (currentPublisher) {
        name = getTranslateText(_.get(currentPublisher, 'prefLabel'));
      }
    }

    const label = (
      <FilterOption
        key={`${node.key}|${i}`}
        itemKey={0.5}
        value={node.key}
        label={name}
        count={node.count}
        onClick={handleFiltering}
        active={isActiveFilter(activeFilter, node.key)}
        displayClass={hasSomeChildren(node) ? 'inline-block' : ''}
      />
    );
    if (node.key !== 'ukjent' && node.key !== 'MISSING') {
      if (!hasSomeChildren(node)) {
        return label;
      }

      return (
        <div key={`panel${i}`} className="section">
          <TreeView
            key={`${node.key}|${i}`}
            nodeLabel={label}
            defaultCollapsed={collapsed}
            itemClassName="tree-view_main"
          >
            {subTree({
              aggregations: node.children,
              activeFilter,
              referenceDataItems,
              handleFiltering
            })}
          </TreeView>
        </div>
      );
    }
    name = localization.unknown;
    return (
      <FilterOption
        key={`${node.key}|${i}`}
        itemKey={0.5}
        value={node.key}
        label={name}
        count={node.count}
        onClick={handleFiltering}
        active={isActiveFilter(activeFilter, node.key)}
      />
    );
  });

export class FilterTree extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      openFilter: true,
      openList: false
    };
    this.toggleFilter = this.toggleFilter.bind(this);
    this.toggleList = this.toggleList.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  onChange(value) {
    if (!value) {
      this.props.onSearch(null, '');
    } else {
      this.props.onSearch(value.name, value.orgPath);
    }
  }

  toggleFilter() {
    this.setState({ openFilter: !this.state.openFilter });
  }

  toggleList() {
    this.setState({ openList: !this.state.openList });
  }

  render() {
    const { openFilter, openList } = this.state;
    const {
      title,
      aggregations,
      handleFiltering,
      activeFilter,
      referenceDataItems,
      collapseItems
    } = this.props;

    const aggregationsForest = keyPrefixForest(aggregations);

    const collapseIconClass = cx('fa', 'mr-2', {
      'fa-angle-down': !this.state.openFilter,
      'fa-angle-up': this.state.openFilter
    });
    if (Array.isArray(aggregations) && aggregations.length > 0) {
      return (
        <div className="fdk-filter-tree">
          <div className="fdk-panel__header">
            <button
              className="fdk-publisher-toggle p-0"
              onClick={this.toggleFilter}
            >
              <i className={collapseIconClass} />
              <span>{title}</span>
            </button>
          </div>
          <Collapse isOpen={openFilter}>
            <div className="fdk-panel__content">
              <div className="fdk-items-list">
                {mainTree({
                  aggregationsForest: collapseItems
                    ? aggregationsForest.slice(0, 5)
                    : aggregationsForest,
                  activeFilter,
                  referenceDataItems,
                  handleFiltering
                })}
                {collapseItems &&
                  aggregationsForest.length > 5 && (
                    <div>
                      <Collapse isOpen={openList}>
                        <div>
                          {mainTree({
                            aggregationsForest: aggregationsForest.slice(5),
                            activeFilter,
                            referenceDataItems,
                            handleFiltering
                          })}
                        </div>
                      </Collapse>
                      <button
                        className="fdk-toggleList"
                        onClick={this.toggleList}
                      >
                        {openList
                          ? localization.facet.showfewer
                          : localization.facet.showmore}
                      </button>
                    </div>
                  )}
              </div>
            </div>
          </Collapse>
        </div>
      );
    }
    return null;
  }
}

FilterTree.defaultProps = {
  title: null,
  aggregations: null,
  activeFilter: null,
  referenceDataItems: null,
  collapseItems: false
};

FilterTree.propTypes = {
  title: PropTypes.string,
  aggregations: PropTypes.array,
  handleFiltering: PropTypes.func.isRequired,
  activeFilter: PropTypes.string,
  referenceDataItems: PropTypes.object,
  collapseItems: PropTypes.bool
};