/**
 * @flow
 */
import React from 'react';
import FlatContainer from '../components/FlatContainer';
import styles from '../components/Styles';
import {Button, Divider, ListItem, Text} from 'react-native-elements';
import RestApi from '../router/Api';
import {StatusBar, TouchableOpacity, View} from 'react-native';
import {theme} from '../core/theme';
import BottomSheet from 'reanimated-bottom-sheet';
import {inject, observer} from 'mobx-react';
import ListOptions from '../components/ListOptions';
import AlertDialog from '../components/AlertDialog';

var moment = require('moment');

@inject('orderStore')
@observer
class HistoryScreen extends React.PureComponent {
  screenHeight = 0;
  bs = React.createRef();
  state = {
    listData: [],
    kategori: [],

    orderList: [],
    selectedTransaksi: null,
    selectedKategori: null,
    jumlahPesanan: 1,
    totalHarga: 0,

    bsMaxHeight: 0,
    bsMidHeight: 0,
    alertVisible: false,
    pesanBatal: 'Batalkan Order Laundry Sekarang ?',
    batalID: null,
    openBs: false,
  };

  constructor(props) {
    super(props);
    this.loadingData();
  }

  loadingData() {
    RestApi.get('/order/history')
      .then(res => {
        this.setState({listData: res.data.value});
        console.log('res', res);
      })
      .catch(err => {
        console.log('error res', err);
        this.setState({listData: []});
      });
  }

  listViewBarang(detail) {
    // console.log(JSON.stringify(detail));
    let kategori = [];
    detail.barang.map(d => {
      let selectedKat = d.selectedKategori;
      let status = d.status[d.status.length - 1];
      kategori.push({
        key: d.idk,
        title: (
          <Text style={[styles.titleList, {color: theme.colors.primary}]}>
            {d.name}
          </Text>
        ),
        subtitle: (
          <Text style={[styles.titleList, {color: theme.colors.secondary}]}>
            {selectedKat.name} ({selectedKat.waktuPengerjaan} Jam)
          </Text>
        ),
        rightElement: (
          <Button
            type={'outline'}
            title={status.label}
            disabled={status.label !== 'diterima'}
            titleStyle={{
              fontSize: 12,
              color: this.getStatusColor(status.label),
            }}
            buttonStyle={{
              height: 30,
              borderColor: this.getStatusColor(status.label),
              width: 75,
            }}
          />
        ),
        rightAvatar: (
          <View style={{flexDirection: 'column'}}>
            <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
              {d.detail.diskonStatus || selectedKat.diskonStatus ? (
                <Text style={{color: theme.colors.accent, fontSize: 12}}>
                  Disc.
                </Text>
              ) : null}
              {this.showDiscount(
                d.detail,
                '',
                '',
                {
                  color: theme.colors.accent,
                  fontSize: 12,
                },
                detail.isMember,
              )}
              {d.detail.diskonStatus && selectedKat.diskonStatus ? (
                <Text style={{color: theme.colors.accent, fontSize: 12}}>
                  &nbsp;&&nbsp;
                </Text>
              ) : null}
              {this.showDiscount(
                selectedKat,
                '',
                '',
                {
                  color: theme.colors.accent,
                  fontSize: 12,
                },
                detail.isMember,
              )}
            </View>
            <View
              style={{
                flexDirection: 'row',
              }}>
              <Text style={styles.subtitleList}>
                {selectedKat.harga.toString().formatNumber()} (x{d.jumlah})
              </Text>
            </View>
          </View>
        ),
      });
    });

    return kategori;
  }

  showBottomSheet(indexRow, total) {
    let data = this.state.listData[indexRow];
    data.total = total;
    this.setState({selectedTransaksi: data, openBs: true});
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

  total(selectedTransaksi, selectedKategori, jumlahPesanan, isMember) {
    let total = 0;
    let potongan = 0;
    if (selectedKategori) {
      let {diskon, harga, diskonStatus} = selectedKategori;
      const {detail} = selectedTransaksi;
      let jp = jumlahPesanan.toString().replace(',', '.') || 0;
      harga = parseFloat(harga);
      jp = parseFloat(jp);

      // diskon utama
      potongan += detail.diskonStatus
        ? this.diskonCounter(
            isMember ? detail.diskon.member : detail.diskon.general,
            harga,
            jp,
          )
        : 0;

      // diskon kategori
      potongan += diskonStatus
        ? this.diskonCounter(
            isMember ? diskon.member : diskon.general,
            harga,
            jp,
          )
        : 0;

      total = harga * jp - potongan;
    }
    return total;
  }

  showDiscount(detail, prefix, suffix, style, isMember) {
    if (detail.diskonStatus) {
      if (isMember) {
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
    return null;
  }

  content() {
    const {
      ido,
      created_at,
      detail,
      total,
      status,
    } = this.state.selectedTransaksi;
    return (
      <View
        style={{
          paddingHorizontal: 20,
          paddingBottom: 15,
          backgroundColor: '#fff',
        }}>
        <View style={styles.rowsBetween}>
          <Text style={styles.titleList}>ID#{ido}</Text>
          <Text style={{fontSize: 14, fontWeight: 'bold'}}>
            {moment(created_at).format('DD/MM/YYYY')}
          </Text>
        </View>
        <Divider style={styles.divider} />
        <Text style={[styles.textLabel, {marginBottom: 10, fontSize: 15}]}>
          Barang Laundry
        </Text>
        <ListOptions
          options={this.listViewBarang(detail)}
          containerStyle={{
            paddingHorizontal: 0,
            paddingVertical: 10,
          }}
        />
        <Divider style={[styles.divider, {backgroundColor: '#e2e2e2'}]} />
        <View style={styles.rowsBetween}>
          <Text style={[styles.textLabel, {fontSize: 15}]}>Total</Text>
          <Text style={[styles.textLabel, {fontSize: 15}]}>Rp{total}</Text>
        </View>
        <Divider style={[styles.divider, {backgroundColor: '#e2e2e2'}]} />
        <View style={{marginVertical: 10}}>
          <Text style={styles.textLabel}>Waktu Jemput</Text>
          <Text style={styles.subtitleList}>
            {moment(detail.waktuJemput).format('DD MMMM YYYY H:mm')}
          </Text>
        </View>
        <View style={{marginVertical: 10}}>
          <Text style={styles.textLabel}>Nomor Ponsel</Text>
          <Text style={styles.subtitleList}>{detail.noHp}</Text>
        </View>
        <View style={{marginVertical: 10}}>
          <Text style={styles.textLabel}>Alamat</Text>
          <Text style={styles.subtitleList}>{detail.alamat}</Text>
        </View>
        <View style={{marginVertical: 10}}>
          <Text style={styles.textLabel}>Catatan</Text>
          <Text style={styles.subtitleList}>{detail.catatan}</Text>
        </View>
        <View style={{marginVertical: 15}}>
          <Button
            title={'Batalkan'}
            type={'outline'}
            disabled={!JSON.stringify(['1']).includes(status)}
            buttonStyle={{borderColor: theme.colors.accent}}
            titleStyle={{color: theme.colors.accent}}
            onPress={() => {
              this.setState({alertVisible: true, batalID: ido});
            }}
          />
        </View>
      </View>
    );
  }

  btnBatalkan() {
    const oldPesan = this.state.pesanBatal;
    this.setState({pesanBatal: 'Sedang Membatalkan Orderan Anda'});
    RestApi.post('/order/batalkan', {id: this.state.batalID})
      .then(response => {
        this.setState({batalID: null, pesanBatal: oldPesan});
        this.bs.current.snapTo(2);
        this.loadingData();
      })
      .catch(e => {
        console.log('errorRespon', e);
      });
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
      {this.state.selectedTransaksi && this.content()}
    </View>
  );

  renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.panelHeader}>
        <View style={styles.panelHandle} />
      </View>
    </View>
  );

  getStatusColor(label) {
    let status = {
      menunggu: '#ff005a',
      batal: '#ffb700',
      dijemput: '#00aa2f',
      diproses: '#004fff',
      selesai: '#909090',
      diantar: '#004fff',
      diterima: '#ffb700',
    };
    return status[label.toString().toLowerCase()];
  }

  getStatusLabel(key) {
    let status = [
      'menunggu',
      'batal',
      'dijemput',
      'diproses',
      'selesai',
      'diantar',
      'diterima',
    ];
    return status[key - 1];
  }

  getStatusColorByKey(key) {
    let status = [
      '#ff005a',
      '#ffb700',
      '#00aa2f',
      '#004fff',
      '#909090',
      '#004fff',
      '#ffb700',
    ];
    return status[key - 1];
  }

  render() {
    console.info('#render : ', 'HistoryScreen.js');
    const {listData, bsMaxHeight, bsMidHeight} = this.state;
    return (
      <View
        onLayout={event => {
          this.screenHeight = event.nativeEvent.layout.height;
        }}
        style={{flexGrow: 1}}>
        <StatusBar backgroundColor={theme.colors.tabHistoryStatusBar} />
        <View
          style={{
            flexDirection: 'row',
            paddingVertical: 8,
            backgroundColor: theme.colors.tabHistory,
          }}>
          <View
            style={{
              flexDirection: 'column',
              justifyContent: 'center',
              paddingHorizontal: 15,
            }}>
            <Text style={[styles.textHeader, {color: '#fff'}]}>
              Riwayat Laundry
            </Text>
            <Text
              style={[styles.textSecondary, {color: '#fff', marginTop: -5}]}>
              Disini tempat riwayat order laundry kamu
            </Text>
          </View>
        </View>
        <View
          style={{
            flex: 1,
            height: 100,
          }}>
          <FlatContainer
            onRefresh={() => this.loadingData()}
            style={{marginBottom: 50}}>
            {listData.length === 0 ? (
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
            ) : null}
            {listData.map((list, i) => {
              let totalLaundry = 0;
              list.detail.barang.forEach(d => {
                totalLaundry += this.total(
                  d,
                  d.selectedKategori,
                  d.jumlah,
                  list.detail.isMember,
                );
              });

              totalLaundry = totalLaundry.toString().formatNumber();
              return (
                <ListItem
                  key={i}
                  underlayColor={'rgba(0,0,0,0.14)'}
                  onPress={() => this.showBottomSheet(i, totalLaundry)}
                  title={list.ido}
                  titleStyle={[
                    styles.titleList,
                    {fontSize: 13, color: theme.colors.primary},
                  ]}
                  subtitle={
                    <View style={{flexDirection: 'column'}}>
                      <Text style={{fontSize: 18}}>Rp{totalLaundry}</Text>
                    </View>
                  }
                  containerStyle={{paddingVertical: 15}}
                  subtitleStyle={styles.subtitleList}
                  rightElement={
                    <View style={{flexDirection: 'column'}}>
                      <Text
                        style={[
                          styles.titleList,
                          {alignSelf: 'flex-end', fontSize: 13},
                        ]}>
                        {moment(list.created_at).format('DD/MM/YYYY')}
                      </Text>
                      <Button
                        type={'outline'}
                        title={this.getStatusLabel(list.status).toUpperCase()}
                        titleStyle={{
                          fontSize: 12,
                          color: this.getStatusColorByKey(list.status),
                        }}
                        buttonStyle={{
                          height: 20,
                          borderColor: this.getStatusColorByKey(list.status),
                        }}
                      />
                    </View>
                  }
                  bottomDivider
                />
              );
            })}
          </FlatContainer>
        </View>
        <AlertDialog
          dismissable={true}
          onDismiss={() => {
            this.setState({alertVisible: false});
          }}
          visible={this.state.alertVisible}
          title="Pesan"
          btnLeft={{
            title: 'Tidak',
            onPress: () => {
              this.setState({alertVisible: false});
            },
          }}
          btnRight={{
            title: 'Ya',
            onPress: () => {
              this.btnBatalkan();
              this.setState({alertVisible: false});
            },
          }}>
          <Text>{this.state.pesanBatal}</Text>
        </AlertDialog>
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

export default HistoryScreen;
