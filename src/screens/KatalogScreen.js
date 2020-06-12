/**
 * @flow
 */
import React from 'react';
import FlatContainer from '../components/FlatContainer';
import styles from '../components/Styles';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {Badge, Button, Divider, ListItem, Text} from 'react-native-elements';
import RestApi from '../router/Api';
import {
  Image,
  StatusBar,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from 'react-native';
import {theme} from '../core/theme';
import User from '../store/User';
import BottomSheet from 'reanimated-bottom-sheet';
import Path from '../router/Path';
import TextInputMask from 'react-native-text-input-mask';
import {inject, observer} from 'mobx-react';
import ListOptions from '../components/ListOptions';

var moment = require('moment');

@inject('orderStore')
@observer
class KatalogScreen extends React.PureComponent {
  screenHeight = 0;
  bs = React.createRef();
  state = {
    listData: [],
    kategori: [],

    orderList: [],
    selectedBarang: null,
    selectedKategori: null,
    jumlahPesanan: 1,
    totalHarga: 0,

    isMember: false,
    bsMaxHeight: 0,
    bsMidHeight: 0,
    openBs: false,
  };

  constructor(props) {
    super(props);
    this.loadingData();
  }

  async getStatus() {
    const {isMember} = new User();
    let boolMember = await isMember();
    this.setState({isMember: boolMember === '1'});
  }

  loadingData() {
    this.getStatus();
    console.log('response katalog run');
    RestApi.get('/katalog/all-active')
      .then(res => {
        console.log('response katalog', res.data.value);
        this.setState({listData: res.data.value});
        this.syncKatalogWithCart(res.data.value);
      })
      .catch(err => {
        this.setState({listData: []});
        console.log('error katalog', err);
      });
  }

  syncKatalogWithCart(newKatalogData) {
    const {setData, getData} = this.props.orderStore;
    let orderStore = getData;
    if (orderStore.length > 0) {
      let syncResult = [];
      for (let i = 0; i < orderStore.length; i++) {
        for (let j = 0; j < newKatalogData.length; j++) {
          if (JSON.stringify(newKatalogData[j]).includes(orderStore[i].idk)) {
            let tmp = newKatalogData[j];
            const kat = tmp.detail.kategori;
            const okat = orderStore[i].selectedKategori;
            let primaryKat = null;
            let selectedKat = null;

            for (let k = 0; k < kat.length; k++) {
              if (JSON.stringify(kat[k]).includes(okat.name)) {
                selectedKat = kat[k];
                break;
              } else if (kat[k].primary) {
                primaryKat = kat[k];
              }
            }

            tmp.selectedKategori = selectedKat ? selectedKat : primaryKat;
            tmp.jumlah = orderStore[i].jumlah;
            syncResult.push(tmp);
            break;
          }
        }
      }
      console.log('sync res ===> ', syncResult);
      setData(syncResult);
    }
  }

  showBottomSheet(indexRow, dataSelected) {
    let data = this.state.listData[indexRow];
    let kategori = [];
    data.detail.kategori.map(d => {
      if (d.status) {
        kategori.push({
          key: d.name,
          leftElement: null,
          title: (
            <Text style={[styles.titleList, {color: theme.colors.primary}]}>
              {d.name}
            </Text>
          ),
          subtitle: (
            <Text style={styles.titleList}>
              Selesai dalam {d.waktuPengerjaan} Jam
            </Text>
          ),
          value: d,
          rightElement: (
            <View style={{flexDirection: 'column'}}>
              {this.showDiscount(d, 'Disc. (', ')', {
                color: theme.colors.accent,
                alignSelf: 'flex-end',
              })}
              <Text
                style={[
                  styles.subtitleList,
                  {color: theme.colors.secondary, alignSelf: 'flex-end'},
                ]}>
                Rp{d.harga.toString().formatNumber()}
              </Text>
            </View>
          ),
        });
      }
    });

    this.setState({
      selectedBarang: data,
      kategori: kategori,
      jumlahPesanan: dataSelected.jumlah
        ? dataSelected.jumlah.toString().formatNumber()
        : 1,
      selectedKategori: dataSelected.selectedKategori
        ? dataSelected.selectedKategori
        : null,
      openBs: true,
    });
    this.bs.current.snapTo(1);
  }

  formatDiskon(diskon) {
    return parseFloat(diskon.toString().replace('%', ''));
  }

  diskonCounter(diskon, harga, jp) {
    const disc = this.formatDiskon(diskon);
    if (disc !== 0) {
      return harga * (disc / 100) * jp;
    }
    return 0;
  }

  totalHarga() {
    return this.total(
      this.state.selectedBarang,
      this.state.selectedKategori,
      this.state.jumlahPesanan,
    );
  }

  total(selectedBarang, selectedKategori, jumlahPesanan) {
    let total = 0;
    let potongan = 0;
    if (selectedKategori) {
      let {diskon, harga, diskonStatus} = selectedKategori;
      let {detail} = selectedBarang;
      let jp = jumlahPesanan.toString().replace(',', '.') || 0;
      harga = parseFloat(harga);
      jp = parseFloat(jp);

      // diskon utama
      potongan += detail.diskonStatus
        ? this.diskonCounter(
            this.state.isMember ? detail.diskon.member : detail.diskon.general,
            harga,
            jp,
          )
        : 0;

      // diskon kategori
      potongan += diskonStatus
        ? this.diskonCounter(
            this.state.isMember ? diskon.member : diskon.general,
            harga,
            jp,
          )
        : 0;

      total = harga * jp - potongan;
    }
    return total;
  }

  showDiscount(detail, prefix, suffix, style) {
    if (detail.diskonStatus) {
      if (this.state.isMember) {
        if (this.formatDiskon(detail.diskon.member) !== 0) {
          return (
            <Text style={style}>
              {prefix}
              {detail.diskon.member}
              {suffix}
            </Text>
          );
        }
      } else {
        if (this.formatDiskon(detail.diskon.general) !== 0) {
          return (
            <Text style={style}>
              {prefix}
              {detail.diskon.general}
              {suffix}
            </Text>
          );
        }
      }
    }
  }

  btnTambah() {
    if (this.state.selectedKategori) {
      /** @type OrderStore */
      const {setData, getData} = this.props.orderStore;
      let data = this.state.selectedBarang;

      let jp = this.state.jumlahPesanan.toString().replace(',', '.') || 0;
      let tmpOrder = getData;
      let indexToUpdate = null;
      tmpOrder.filter((d, i) => {
        if (JSON.stringify(d).includes(data.idk)) {
          indexToUpdate = i;
        }
      });

      data.selectedKategori = this.state.selectedKategori;
      data.jumlah = parseFloat(jp);
      data.status = [
        {label: 'Menunggu', waktu: moment().format('YYYY-MM-DD HH:mm:ss')},
      ];

      if (indexToUpdate !== null) {
        tmpOrder[indexToUpdate] = data;
      } else {
        tmpOrder.push(data);
      }

      setData(tmpOrder);
      console.log('order list ==> ' + getData.length, JSON.stringify(getData));
      this.bs.current.snapTo(2);
    }
  }

  renderContent = () => (
    <View
      onLayout={event => {
        let h = event.nativeEvent.layout.height + 30;
        if (h >= this.screenHeight) {
          this.setState({
            bsMaxHeight: this.screenHeight,
            bsMidHeight: this.screenHeight / 2,
          });
        } else {
          this.setState({bsMidHeight: h});
        }
      }}>
      {this.state.selectedBarang && (
        <View
          style={{
            paddingHorizontal: 5,
            paddingBottom: 15,
            backgroundColor: '#fff',
          }}>
          <View style={[styles.rowsBetween, {paddingHorizontal: 15}]}>
            <Text style={[styles.textLabel, {marginBottom: 10}]}>
              Pilih Kategori
            </Text>
            <Text style={{fontSize: 16, fontWeight: 'bold'}}>
              Rp
              {this.totalHarga()
                .toString()
                .formatNumber()}
            </Text>
          </View>
          <ListOptions
            options={this.state.kategori}
            onChange={val => this.setState({selectedKategori: val})}
            isSelected={val => this.state.selectedKategori?.name === val.name}
            containerStyle={val => ({
              paddingVertical: 10,
              borderRadius: 15,
              backgroundColor: val ? 'rgba(0,112,255,0.06)' : '#fff',
            })}
          />
          <Divider style={styles.divider} />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 10,
              paddingHorizontal: 15,
              marginBottom: 7,
            }}>
            <View style={{flexDirection: 'column', marginTop: -10}}>
              <Text style={styles.textLabel}>
                Berapa {this.state.selectedBarang.detail.satuan} ?
              </Text>
              <View style={{flexDirection: 'row'}}>
                <TextInputMask
                  onChangeText={(formatted, extracted) => {
                    this.setState({jumlahPesanan: formatted});
                  }}
                  defaultValue={this.state.jumlahPesanan.toString()}
                  keyboardType={'decimal-pad'}
                  style={{
                    minWidth: 80,
                    maxWidth: 100,
                    borderBottomColor: 'grey',
                    borderBottomWidth: 1,
                    textAlign: 'center',
                    fontSize: 16,
                    paddingVertical: 2,
                  }}
                  mask={'[9999],[99]'}
                />
                <Badge
                  value={this.state.selectedBarang.detail.satuan.toUpperCase()}
                  containerStyle={{justifyContent: 'center'}}
                  badgeStyle={{
                    height: 30,
                    paddingHorizontal: 10,
                    backgroundColor: '#eee',
                  }}
                  textStyle={{fontSize: 14, color: theme.colors.secondary}}
                />
              </View>
            </View>
            <View style={{justifyContent: 'center'}}>
              <Button
                type={'outline'}
                buttonStyle={{borderColor: '#1dbc60'}}
                icon={
                  <MaterialCommunityIcons
                    name={'check-circle'}
                    size={24}
                    color={'#1dbc60'}
                  />
                }
                onPress={() => this.btnTambah()}
                titleStyle={{marginLeft: 2, color: '#1dbc60'}}
                title={'TAMBAH'}
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );

  renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.panelHeader}>
        <View style={styles.panelHandle} />
      </View>
    </View>
  );

  render() {
    console.info('#render : ', 'KatalogScreen.js');
    const {listData, bsMaxHeight, bsMidHeight} = this.state;
    let totalLaundry = 0;
    return (
      <View
        onLayout={event => {
          this.screenHeight = event.nativeEvent.layout.height;
        }}
        style={{flexGrow: 1}}>
        <StatusBar backgroundColor={theme.colors.tabOrderStatusBar} />
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            elevation: 4,
            paddingVertical: 8,
            backgroundColor: theme.colors.tabOrder,
          }}>
          <View
            style={{
              flexDirection: 'column',
              justifyContent: 'center',
              paddingHorizontal: 15,
            }}>
            <Text style={[styles.textHeader, {color: '#fff'}]}>Price List</Text>
            <Text
              style={[styles.textSecondary, {color: '#fff', marginTop: -3}]}>
              Pilih barang yang mau di laundry
            </Text>
          </View>
          <TouchableHighlight
            underlayColor={'transparent'}
            style={{justifyContent: 'center'}}
            onPress={() => this.props.navigation.navigate('CartScreen')}>
            <View style={{marginLeft: 5, marginRight: 17}}>
              <MaterialCommunityIcons
                name={'shopping'}
                size={24}
                color={'#FFF'}
              />
              <Badge
                status="error"
                value={this.props.orderStore.getData.length}
                containerStyle={{position: 'absolute', top: -7, right: -9}}
                badgeStyle={{borderWidth: 0}}
              />
            </View>
          </TouchableHighlight>
        </View>
        <View
          style={{
            flex: 1,
            height: 100,
          }}>
          <FlatContainer
            onRefresh={() => this.loadingData()}
            style={{marginBottom: 50}}>
            {listData.length ? (
              listData.map((list, i) => {
                let harga = 0;

                list.detail.kategori.forEach(d => {
                  if (d.primary) {
                    harga = d.harga;
                  }
                });

                let dataSelected = null;
                this.props.orderStore.getData.forEach(d => {
                  if (JSON.stringify(d).includes(list.idk)) {
                    dataSelected = d;
                  }
                });

                if (dataSelected) {
                  totalLaundry += this.total(
                    dataSelected,
                    dataSelected.selectedKategori,
                    dataSelected.jumlah,
                  );
                }

                harga = harga.toString().formatNumber();
                return (
                  <ListItem
                    key={i}
                    underlayColor={'rgba(0,0,0,0.14)'}
                    onPress={() => this.showBottomSheet(i, dataSelected || {})}
                    leftElement={
                      <View
                        style={{
                          borderRadius: 12,
                          backgroundColor: '#fff',
                          elevation: 3,
                        }}>
                        <Image
                          style={{width: 55, height: 55, borderRadius: 12}}
                          source={{
                            uri: `${Path.priceListThumbImage}/${
                              list.detail.photo
                            }`,
                          }}
                        />
                      </View>
                    }
                    rightElement={
                      <View style={{flexDirection: 'column'}}>
                        {dataSelected ? (
                          <MaterialCommunityIcons
                            style={{alignSelf: 'flex-end'}}
                            name={'check'}
                            color={'#00bc4f'}
                            size={24}
                          />
                        ) : null}
                      </View>
                    }
                    title={list.name}
                    titleStyle={[
                      styles.titleList,
                      {fontSize: 15, fontWeight: 'bold'},
                    ]}
                    subtitle={
                      <View style={{flexDirection: 'column'}}>
                        <Text style={styles.subtitleList}>
                          Rp{harga} /{' '}
                          {list.detail.satuan.toString().toUpperCase()}
                        </Text>
                        {this.showDiscount(list.detail, 'Disc. (', ')', {
                          fontSize: 13,
                          color: theme.colors.accent,
                          // marginLeft: 10,
                        })}
                      </View>
                    }
                    containerStyle={{paddingVertical: 13}}
                    subtitleStyle={styles.subtitleList}
                  />
                );
              })
            ) : (
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  paddingHorizontal: 35,
                }}>
                <Text style={{textAlign: 'center', color: '#b9b9b9'}}>
                  Sepertinya ada masalah dengan jaringan anda, Silahkan periksa
                  koneksi data anda.
                </Text>
              </View>
            )}
          </FlatContainer>
        </View>
        <View
          style={{
            justifyContent: 'flex-end',
            marginBottom: 0,
          }}>
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              flexDirection: 'row',
              justifyContent: 'space-between',
              width: '100%',
              backgroundColor: '#1dbc60',
              paddingVertical: 5,
              paddingLeft: 20,
            }}>
            <View style={{flexDirection: 'column'}}>
              <Text style={{fontSize: 12, color: '#fff'}}>Total</Text>
              <Text
                style={{
                  fontSize: 18,
                  alignSelf: 'center',
                  color: '#fff',
                  marginTop: -5,
                }}>
                Rp{totalLaundry.toString().formatNumber()}
              </Text>
            </View>
            <Button
              type={'clear'}
              title={'LANJUT'}
              icon={
                <MaterialCommunityIcons
                  name={'chevron-right'}
                  size={24}
                  color={'#fff'}
                />
              }
              iconRight={true}
              titleStyle={{color: '#fff'}}
              buttonStyle={{borderRadius: 50}}
              onPress={() => this.props.navigation.navigate('CartScreen')}
            />
          </View>
        </View>
        <BottomSheet
          ref={this.bs}
          snapPoints={[bsMaxHeight, bsMidHeight, 0]}
          renderContent={this.renderContent}
          renderHeader={this.renderHeader}
          initialSnap={2}
          onCloseEnd={() => {
            if (this.state.openBs) {
              this.setState({openBs: false});
            }
          }}
        />
        {this.state.openBs ? (
          <TouchableOpacity
            onPress={() => {
              this.bs.current.snapTo(2);
              this.setState({openBs: false});
            }}
            style={{
              position: 'absolute',
              backgroundColor: 'rgba(0,0,0,0.27)',
              height: '100%',
              width: '100%',
              zIndex: 1,
            }}
          />
        ) : null}
      </View>
    );
  }
}

export default KatalogScreen;
