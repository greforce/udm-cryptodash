import React from 'react';
import cc from 'cryptocompare';
import _ from 'lodash';

export const AppContext = React.createContext();

const MAX_FAVORITES = 10;

export class AppProvider extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 'dashboard',
      favorites: ['BTC', 'ETH', 'XMR', 'DOGE'],
      ...this.savedSettings(),
      setPage: this.setPage,
      confirmFavorites: this.confirmFavorites,
      addCoin: this.addCoin,
      removeCoin: this.removeCoin,
      isInFavorites: this.isInFavorites,
      setFilteredCoins: this.setFilteredCoins,
    };
  }

  componentDidMount() {
    this.fetchCoins();
    this.fetchPrices();
  }

  fetchCoins = async () => {
    let coinList = (await cc.coinList()).Data;
    this.setState({ coinList });
  }

  fetchPrices = async () => {
    if (this.state.firstVisit) return;
    let prices = await this.prices();
    console.log(prices);
    this.setState({ prices });
  }

  prices = async () => {
    let returnData = [];
    for (let i = 0; i < this.state.favorites.length; i++) {
      try {
        let priceData = await cc.priceFull(this.state.favorites[i], 'USD');
        returnData.push(priceData);
      } catch (err) {
        console.warn('Fetch price error:', err);
      }
    }
    return returnData;
  }

  addCoin = key => {
    let favorites = [...this.state.favorites];
    if (favorites.length < MAX_FAVORITES) {
      favorites.push(key);
      this.setState({ favorites });
    }
  }

  removeCoin = key => {
    let favorites = [...this.state.favorites];
    this.setState({ favorites: _.pull(favorites, key) });
  }

  isInFavorites = key => _.includes(this.state.favorites, key);

  confirmFavorites = () => {
    this.setState({
      firstVisit: false,
      page: 'dashboard',
    }, () => {
      this.fetchPrices();
    });
    localStorage.setItem('cryptoDash', JSON.stringify({
      favorites: this.state.favorites,
    }));
  }

  savedSettings() {
    let cryptoDashData = JSON.parse(localStorage.getItem('cryptoDash'));
    if (!cryptoDashData) {
      return { page: 'settings', firstVisit: true };
    }
    let { favorites } = cryptoDashData;
    return { favorites };
  }

  setPage = page => this.setState({ page });

  setFilteredCoins = (filteredCoins) => this.setState({ filteredCoins });

  render() {
    return (
      <AppContext.Provider value={this.state}>
        {this.props.children}
      </AppContext.Provider>
    );
  }

}