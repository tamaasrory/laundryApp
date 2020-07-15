/**
 * @flow
 */
import React from 'react';
import RestApi from '../router/Api';

class DetailOrderScreen extends React.PureComponent {
  state = {
    transaksi: null,
    isLoading: true,
    errorLoadingData: false,
  };

  constructor(props) {
    super(props);
    this.loadingData();
  }

  loadingData() {
    const {id} = this.props.route.params;
    console.log(id);
    this.setState({isLoading: true, errorLoadingData: false});
  }

  render() {
    return undefined;
  }
}

export default DetailOrderScreen;
