import React from 'react';
import PropTypes from 'prop-types';

import localization from '../../components/localization';

export default class DatasetDescription extends React.Component { // eslint-disable-line react/prefer-stateless-function
  _renderPublisher() {
    const { publisher } = this.props;
    const ownedBy = localization.search_hit.owned;
    if (publisher && publisher.name) {
      return (
        <span>
          {ownedBy}&nbsp;
          <strong id="dataset-descritption-publisher-text" className="fdk-strong-virksomhet">
            {publisher ? publisher.name.charAt(0) + publisher.name.substring(1).toLowerCase() : ''}
          </strong>
        </span>
      );
    }
    return null;
  }

  _renderThemes() {
    let themeNodes = null;
    const { themes } = this.props;
    if (themes) {
      themeNodes = themes.map(singleTheme => (
        <div
          key={`dataset-description-theme-${singleTheme.code}`}
          id={`dataset-description-theme-${singleTheme.code}`}
          className="fdk-label fdk-label-on-grey"
        >
          {singleTheme.title[this.props.selectedLanguageCode] || singleTheme.title.nb || singleTheme.title.nn || singleTheme.title.en}
        </div>
      ));
    }
    return themeNodes;
  }

  render() {
    return (
      <div id="dataset-description">
        {this.props.title &&
        <h1 className="fdk-margin-bottom">
          {this.props.title}
        </h1>
        }

        <div className="fdk-margin-bottom">
          {this._renderPublisher()}
          {this._renderThemes()}
        </div>

        {this.props.description &&
        <p className="fdk-ingress">
          {this.props.description}
        </p>
        }

      </div>
    );
  }
}

DatasetDescription.defaultProps = {
  title: '',
  description: '',
  publisher: null,
  themes: null,
  selectedLanguageCode: ''
};

DatasetDescription.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  publisher: PropTypes.object,
  themes: PropTypes.array,
  selectedLanguageCode: PropTypes.string
};
