/**
 * @flow
 */
import React from 'react';
import FlatContainer from '../components/FlatContainer';
import styles from '../components/Styles';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {Badge, Button, Divider, ListItem, Text} from 'react-native-elements';
import {Image, Keyboard, TouchableOpacity, View} from 'react-native';
import {theme} from '../core/theme';
import User from '../store/User';
import BottomSheet from 'reanimated-bottom-sheet';
import Path from '../router/Path';
import TextInputMask from 'react-native-text-input-mask';
import {inject, observer} from 'mobx-react';
import ListOptions from '../components/ListOptions';
import {Colors} from 'react-native-paper';
var moment = require('moment');

@inject('orderStore')
@observer
class CartScreen extends React.PureComponent {
  screenHeight = 0;
  bs = React.createRef();
  state = {
    kategori: [],
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
    this.getStatus();
  }

  async getStatus() {
    const {isMember} = new User();
    let boolMember = await isMember();
    this.setState({isMember: boolMember === '1'});
  }

  showBottomSheet(indexRow, dataSelected) {
    let data = this.props.orderStore.getData[indexRow];
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
              {this.showDiscount(data.detail, 'Disc. (', ')', {
                color: theme.colors.accent,
                alignSelf: 'flex-end',
              })}
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
        : 0,
      checked: !!dataSelected.jumlah,
      selectedKategori: dataSelected.selectedKategori
        ? dataSelected.selectedKategori
        : null,
      openBs: true,
    });
    this.bs.current.snapTo(1);
  }

  deleteItem(e) {
    let tmpOrder = [];
    this.props.orderStore.getData.forEach((d, i) => {
      if (!JSON.stringify(d).includes(e.idk)) {
        tmpOrder.push(d);
      }
    });

    this.props.orderStore.setData(tmpOrder);
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
      // console.log('order list ==> ' + getData.length, JSON.stringify(getData));
      this.bs.current.snapTo(2);
      Keyboard.dismiss();
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
            paddingHorizontal: 0,
            paddingBottom: 25,
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
              borderRadius: 0,
              backgroundColor: val ? 'rgba(31,191,0,0.15)' : '#fff',
            })}
          />
          <Divider style={styles.divider} />

          <Text style={[styles.textLabel, {paddingHorizontal: 15}]}>
            Berapa {this.state.selectedBarang.detail.satuan} ?
          </Text>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 10,
              paddingHorizontal: 15,
              marginBottom: 7,
            }}>
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: '#eee',
                borderRadius: 15,
                paddingVertical: 5,
              }}>
              <TextInputMask
                onChangeText={(formatted, extracted) => {
                  let tmp = formatted.toString().replace(',', '.');
                  tmp = (tmp * 1).toString().replace('.', ',');
                  this.setState({
                    jumlahPesanan: tmp,
                  });
                }}
                defaultValue={this.state.jumlahPesanan.toString()}
                keyboardType={'decimal-pad'}
                style={{
                  minWidth: 80,
                  maxWidth: 100,
                  textAlign: 'center',
                  fontSize: 18,
                  paddingVertical: 2,
                }}
                mask={
                  this.state.selectedBarang.detail.decimal
                    ? '[9999],[99]'
                    : '[9999]'
                }
              />
              <Badge
                value={this.state.selectedBarang.detail.satuan.toUpperCase()}
                containerStyle={{justifyContent: 'center'}}
                badgeStyle={{
                  height: 30,
                  paddingHorizontal: 10,
                  backgroundColor: '#eee',
                  borderWidth: 0,
                }}
                textStyle={{fontSize: 14, color: theme.colors.secondary}}
              />
            </View>
            <Button
              type={'solid'}
              disabled={
                !(
                  parseFloat(this.state.jumlahPesanan) &&
                  this.state.selectedKategori
                )
              }
              buttonStyle={{
                borderColor: '#1dbc60',
                backgroundColor: '#1dbc60',
                borderRadius: 15,
                paddingHorizontal: 15,
              }}
              icon={
                <MaterialCommunityIcons
                  name={'check-circle'}
                  size={24}
                  color={'#fff'}
                />
              }
              onPress={() => this.btnTambah()}
              titleStyle={{marginLeft: 2, color: '#fff'}}
              title={'UBAH'}
            />
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
    console.info('#render : ', 'CartScreen.js');
    const {bsMaxHeight, bsMidHeight} = this.state;
    let totalLaundry = 0;

    return (
      <View
        onLayout={event => {
          this.screenHeight = event.nativeEvent.layout.height;
        }}
        style={{flexGrow: 1}}>
        <View
          style={{
            flexDirection: 'row',
            paddingVertical: 8,
            backgroundColor: theme.colors.tabOrder,
          }}>
          <Button
            type={'clear'}
            onPress={() => this.props.navigation.goBack()}
            containerStyle={{justifyContent: 'center'}}
            icon={
              <MaterialCommunityIcons
                name={'arrow-left'}
                size={28}
                color={theme.colors.textToolBar}
              />
            }
          />
          <View
            style={{
              flexDirection: 'column',
              justifyContent: 'center',
              paddingHorizontal: 15,
            }}>
            <Text
              style={[styles.textHeader, {color: theme.colors.textToolBar}]}>
              Keranjang
            </Text>
            <Text
              style={[
                styles.textSecondary,
                {color: theme.colors.textToolBar, marginTop: -3},
              ]}>
              Daftar barang yang akan kamu laundry
            </Text>
          </View>
        </View>
        <View
          style={{
            flex: 1,
            height: 100,
          }}>
          <FlatContainer style={{marginBottom: 50}}>
            {this.props.orderStore.getData.length === 0 ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  paddingHorizontal: 35,
                }}>
                <Text style={{textAlign: 'center', color: '#b9b9b9'}}>
                  Kamu belum memilih barang yang mau di laundry
                </Text>
              </View>
            ) : null}
            {this.props.orderStore.getData.map((list, i) => {
              let harga = 0;
              let subtotal = 0;
              let diskonPrimary = {};

              list.detail.kategori.forEach(d => {
                if (d.primary) {
                  harga = d.harga;
                  diskonPrimary = d;
                }
              });

              let dataSelected = null;
              this.props.orderStore.getData.forEach(d => {
                if (JSON.stringify(d).includes(list.idk)) {
                  dataSelected = d;
                }
              });

              if (dataSelected) {
                subtotal = this.total(
                  dataSelected,
                  dataSelected.selectedKategori,
                  dataSelected.jumlah,
                );
                totalLaundry += subtotal;
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
                        style={{width: 45, height: 45, borderRadius: 12}}
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
                      <View style={{flexDirection: 'column', paddingTop: 5}}>
                        <View
                          style={{flexDirection: 'row', alignSelf: 'flex-end'}}>
                          <Text
                            style={{
                              fontSize: 12,
                              fontWeight: 'bold',
                              textAlign: 'center',
                            }}>
                            {list.jumlah}
                          </Text>
                          <Text
                            style={{
                              fontSize: 12,
                              textAlign: 'center',
                              marginLeft: 2,
                            }}>
                            {list.detail.satuan.toUpperCase()}
                          </Text>
                        </View>
                        <Text style={{fontWeight: 'bold'}}>
                          Rp{subtotal.toString().formatNumber()}
                        </Text>
                      </View>
                      <Button
                        type={'clear'}
                        buttonStyle={{
                          alignSelf: 'flex-end',
                          padding: 0,
                        }}
                        titleStyle={{color: Colors.red500, fontSize: 13}}
                        onPress={() => this.deleteItem(list)}
                        title={'HAPUS'}
                      />
                    </View>
                  }
                  title={list.name}
                  titleStyle={[
                    styles.titleList,
                    {fontSize: 14, fontWeight: 'bold'},
                  ]}
                  subtitle={
                    <View style={{flexDirection: 'column'}}>
                      <Text style={styles.subtitleList}>
                        Rp{harga} /{' '}
                        {list.detail.satuan.toString().toUpperCase()}
                      </Text>
                      {/*hanya discount global saja yang muncul*/}
                      {this.showDiscount(list.detail, 'Disc. (', ')', {
                        fontSize: 13,
                        color: theme.colors.accent,
                        // marginLeft: 10,
                      })}
                      {this.showDiscount(diskonPrimary, 'Disc. (', ')', {
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
            })}
          </FlatContainer>
        </View>

        {this.props.orderStore.getData.length !== 0 ? (
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
                backgroundColor: '#009a32',
                paddingVertical: 10,
                paddingLeft: 20,
              }}>
              <View style={{flexDirection: 'column'}}>
                <Text style={{fontSize: 14, color: '#fff'}}>Total</Text>
                <Text
                  style={{
                    fontSize: 20,
                    alignSelf: 'center',
                    color: '#fff',
                    marginTop: -3,
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
                onPress={() => this.props.navigation.navigate('OrderScreen')}
              />
            </View>
          </View>
        ) : null}
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

export default CartScreen;
