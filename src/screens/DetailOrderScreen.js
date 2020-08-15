/**
 * @flow
 */
import React, {createRef} from 'react';
import RestApi from '../router/Api';
import {ActivityIndicator, StatusBar, View} from 'react-native';
import styles from '../components/Styles';
import {Button, Divider, Text} from 'react-native-elements';
import moment from '../components/DateFormater';
import ListOptions from '../components/ListOptions';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {theme} from '../core/theme';
import AlertDialog from '../components/AlertDialog';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import FlatContainer from '../components/FlatContainer';
import ViewShot from 'react-native-view-shot';

class DetailOrderScreen extends React.PureComponent {
  state = {
    transaksi: {},
    total: 0,
    isLoading: true,
    errorLoadingData: false,
    pesanDialog: 'Yakin Batalkan Laundry ?',
  };

  constructor(props) {
    super(props);
    this.loadingData();
  }

  loadingData() {
    const {id} = this.props.route.params;
    console.log('params => ', id);
    this.setState({isLoading: true, errorLoadingData: false});
    RestApi.get(`/order/detail/${id}`)
      .then(res => {
        this.setState({
          transaksi: res.data.value,
          isLoading: false,
          errorLoadingData: false,
        });
        // console.log('res', res.data.msg);
      })
      .catch(err => {
        console.log('error res', err);
        this.setState({
          transaksi: {},
          isLoading: false,
          errorLoadingData: true,
        });
      });
  }

  btnBatalkan() {
    const oldPesan = this.state.pesanDialog;
    this.setState({
      pesanDialog: 'Sedang Membatalkan Orderan Anda',
    });
    RestApi.post('/order/batalkan', {id: this.state.batalID})
      .then(response => {
        this.setState({batalID: null, pesanDialog: oldPesan, openBs: false});
        this.props.navigation.pop(2);
        this.props.navigation.navigate({name: 'HistoryScreen'});
      })
      .catch(e => {
        this.setState({batalID: null, openBs: false});
        console.log('errorRespon', e);
      });
  }

  postTerimaLaundry(idk) {
    let transaksi = this.state.transaksi;
    let tmpStateValue = {};
    tmpStateValue[idk] = true;
    this.setState(tmpStateValue);
    // const oldPesan = this.state.pesanDialog;
    RestApi.post('/order/terima', {
      id: transaksi.ido,
      idk: idk,
    })
      .then(res => {
        //console.log('terima laundry', res.data.value);
        if (res.data.value !== '0') {
          let barang = transaksi.detail.barang;
          let tmpIndex = null;
          for (let i = 0; i < barang.length; i++) {
            if (JSON.stringify(barang[i]).includes(idk)) {
              transaksi.detail.barang[i].status.push(res.data.value);
              tmpIndex = i;
            }
          }
          setTimeout(() => {
            tmpStateValue[idk] = false;
            tmpStateValue.transaksi = transaksi;
            this.setState(tmpStateValue);
            console.log(
              'Transaksi',
              this.state.transaksi.detail.barang[tmpIndex].status,
            );
          }, 1000);
        }
        // this.loadingData();
        // this.setState({
        //   alertVisible: false,
        //   pesanDialog: oldPesan,
        //   openBs: false,
        // });
      })
      .catch(error => {
        console.log(error);
        tmpStateValue[idk] = false;
        this.setState(tmpStateValue);
        // this.setState({
        //   alertVisible: false,
        //   pesanDialog: oldPesan,
        //   openBs: false,
        // });
      });
  }

  _renderShimmerList(numberRow) {
    let shimmerRows = [];
    for (let index = 0; index < numberRow; index++) {
      shimmerRows.push(
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingVertical: 15,
            paddingHorizontal: 0,
            borderTopWidth: 0.5,
            borderTopColor: '#ddd',
          }}>
          <View style={{alignSelf: 'center'}}>
            <ShimmerPlaceHolder
              autoRun={true}
              style={{
                width: '100%',
                height: 15,
                marginBottom: 7,
                borderRadius: 10,
              }}
            />
            <ShimmerPlaceHolder
              autoRun={true}
              style={{
                width: '50%',
                height: 12,
                marginBottom: 7,
                borderRadius: 10,
              }}
            />
            <ShimmerPlaceHolder
              autoRun={true}
              style={{
                width: '70%',
                height: 12,
                borderRadius: 10,
              }}
            />
          </View>
          <ShimmerPlaceHolder
            autoRun={true}
            style={{
              width: '20%',
              height: 15,
              alignSelf: 'center',
              borderRadius: 10,
            }}
          />
        </View>,
      );
    }
    return (
      <View style={{backgroundColor: '#fff'}}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 25,
          }}>
          <ShimmerPlaceHolder
            autoRun={true}
            style={{
              width: '45%',
              height: 15,
              borderRadius: 10,
            }}
          />
          <ShimmerPlaceHolder
            autoRun={true}
            style={{
              width: '25%',
              height: 15,
              borderRadius: 10,
            }}
          />
        </View>
        <ShimmerPlaceHolder
          autoRun={true}
          style={{
            width: '35%',
            height: 15,
            marginBottom: 15,
            borderRadius: 10,
          }}
        />
        {shimmerRows}
      </View>
    );
  }

  total(globalDiskonStatus, globalDiskon, selectedKategori, jumlah, isMember) {
    let total = 0;
    let potongan = 0;
    if (selectedKategori) {
      console.log('globalDiskonStatus', globalDiskonStatus);
      let {diskon, harga, diskonStatus} = selectedKategori;
      let jp = jumlah.toString().replace(',', '.') || 0;
      harga = parseFloat(harga);
      jp = parseFloat(jp);

      // diskon utama
      potongan += globalDiskonStatus
        ? this.diskonCounter(
            isMember ? globalDiskon.member : globalDiskon.general,
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
  diskonCounter(diskon, harga, jp) {
    const disc = this.formatDiskon(diskon);
    if (disc !== 0) {
      return harga * (disc / 100) * jp;
    }
    return 0;
  }
  listViewBarang() {
    let total = 0;
    // console.log(JSON.stringify(detail));
    const {detail} = this.state.transaksi;
    // console.log('re render');
    let kategori = [];
    if (typeof detail !== 'undefined') {
      detail.barang.map(d => {
        let selectedKat = d.selectedKategori;
        let status = d.status[d.status.length - 1];
        let totalKat = this.total(
          d.detail.diskonStatus,
          d.detail.diskon,
          selectedKat,
          d.jumlah,
          parseInt(detail.isMember),
        );
        total += totalKat;
        kategori.push({
          key: d.idk,
          value: d.idk,
          title: (
            <Text
              style={[
                styles.titleList,
                {
                  color: theme.colors.secondary,
                  fontSize: 13,
                  fontWeight: 'bold',
                },
              ]}>
              {d.name}
            </Text>
          ),
          subtitle: (
            <View>
              <Text
                style={[
                  styles.titleList,
                  {color: theme.colors.secondary, fontSize: 13},
                ]}>
                {selectedKat.name} ({selectedKat.waktuPengerjaan} Jam)
              </Text>
              <View style={{marginTop: 2, flexDirection: 'row'}}>
                <Text
                  style={[
                    styles.titleList,
                    {
                      color: this.getStatusColor(status.label),
                      fontSize: 13,
                    },
                  ]}>
                  {status.label}
                </Text>
                {status.label !== 'Menunggu' ? (
                  <Text
                    style={{
                      fontSize: 12,
                      color: theme.colors.backdrop,
                      alignSelf: 'flex-end',
                      marginLeft: 3,
                    }}>
                    ({moment(status.waktu).format('DD/MM HH:mm')})
                  </Text>
                ) : null}
              </View>
              {d.waktuPengantaran ? (
                <Text
                  style={{
                    marginTop: 3,
                    fontSize: 12,
                  }}>
                  Estimasi selesai{' '}
                  {moment(d.waktuPengantaran).format('DD/MM HH:mm')}
                </Text>
              ) : null}
            </View>
          ),
          rightAvatar: (
            <View style={{flexDirection: 'column'}}>
              <Text
                style={[
                  styles.subtitleList,
                  {textAlign: 'right', fontSize: 12},
                ]}>
                {selectedKat.harga.toString().formatNumber()} (x{d.jumlah})
              </Text>
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
                  parseInt(detail.isMember),
                )}
                {d.detail.diskonStatus && selectedKat.diskonStatus ? (
                  <Text style={{color: theme.colors.accent, fontSize: 11}}>
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
                  parseInt(detail.isMember),
                )}
              </View>
              <Text
                style={[
                  styles.subtitleList,
                  {textAlign: 'right', fontSize: 13, fontWeight: 'bold'},
                ]}>
                {totalKat.toString().formatNumber()}
              </Text>
              {![
                'Menunggu',
                'Dibatalkan',
                'Sedang Dijemput',
                'Sedang Dilaundry',
                'Telah Diterima',
                'Telah Dijemput',
              ].includes(status.label) ? (
                <Button
                  type={'outline'}
                  title={'Terima Laundry'}
                  titleStyle={{
                    fontSize: 12,
                    color: '#fff',
                  }}
                  disabledTitleStyle={{color: '#fff'}}
                  disabledStyle={{backgroundColor: '#ccc'}}
                  disabled={!!this.state[d.idk]}
                  icon={
                    this.state[d.idk] ? (
                      <ActivityIndicator
                        animating={true}
                        color={theme.colors.white}
                        style={{marginRight: 5}}
                      />
                    ) : null
                  }
                  onPress={() => this.postTerimaLaundry(d.idk)}
                  containerStyle={{marginTop: 2}}
                  buttonStyle={{
                    paddingVertical: 5,
                    borderRadius: 15,
                    backgroundColor: this.getStatusColorByKey(7),
                    borderColor: this.getStatusColorByKey(7),
                  }}
                />
              ) : null}
            </View>
          ),
        });
      });
    }
    this.setState({total: total});
    return kategori;
  }

  formatDiskon(diskon) {
    return parseFloat(diskon.toString().replace('%', ''));
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

  getStatusColor(label) {
    let status = {
      Menunggu: '#ff005a', // Menunggu
      Dibatalkan: '#737373', // Dibatalkan
      'Sedang Dijemput': '#ff8e00', // Sedang Dijemput
      'Sedang Dilaundry': '#009aff', // Sedang Dilaundry
      'Laundry Selesai': '#00aa2f', // Laundry Selesai
      'Sedang Diantar': '#ff8e00', // Sedang Diantar
      'Telah Diterima': '#00aa2f', // Telah Diterima
      'Telah Dijemput': '#00aa2f', // Telah Diterima
      'Telah Diantar': '#00aa2f', // Telah Diterima
    };
    return status[label];
  }

  getStatusLabel(key) {
    let status = [
      'Menunggu',
      'Dibatalkan',
      'Sedang Dijemput',
      'Sedang Dilaundry',
      'Laundry Selesai',
      'Sedang Diantar',
      'Telah Diterima',
      'Telah Dijemput',
    ];
    return status[key - 1];
  }

  getStatusColorByKey(key) {
    let status = [
      '#ff005a', // Menunggu
      '#737373', // Dibatalkan
      '#ff8e00', // Sedang Dijemput
      '#009aff', // Sedang Dilaundry
      '#00aa2f', // Laundry Selesai
      '#ff8e00', // Sedang Diantar
      '#00aa2f', // Telah Diterima
      '#00aa2f', // Telah Dijemput
    ];
    return status[key - 1];
  }

  viewShot = createRef();

  captureInvoice() {
    this.viewShot.capture().then(uri => {
      console.log('do something with ', uri);
    });
  }

  kembalian(tunai) {
    const total = parseFloat(this.state.total);
    tunai = parseFloat(tunai);
    return total > tunai ? 0 : tunai - total;
  }

  getStatusPembayaran(total, pembayaran) {
    total = parseFloat(total);
    pembayaran = parseFloat(pembayaran);
    if (pembayaran === total) {
      return 'Lunas';
    }
    if (pembayaran > 0) {
      return 'Lunas Sebagian';
    }
    return 'Belum Dibayar';
  }

  render() {
    let {
      ido,
      created_at,
      detail,
      pembayaran,
      detail_outlet,
      detail_user,
    } = this.state.transaksi;
    let isBisaBatalkan = false;
    let tunai = 0;
    if (typeof detail !== 'undefined') {
      tunai = detail.tunai || 0;
      console.log('detail_outlet', detail_outlet, detail_user);
      const barang = detail.barang;
      for (let i in barang) {
        const status = barang[i].status;
        isBisaBatalkan = status[status.length - 1].label === 'Menunggu';
        if (isBisaBatalkan) {
          break;
        }
      }
      isBisaBatalkan = !isBisaBatalkan;
    }
    return (
      <FlatContainer
        onRefresh={() => this.loadingData()}
        style={{
          padding: 15,
          backgroundColor: '#fff',
        }}>
        <ViewShot ref={this.viewShot} onCapture={this.onCapture}>
          <StatusBar
            backgroundColor={theme.colors.white}
            barStyle={'dark-content'}
          />
          {this.state.isLoading ? (
            this._renderShimmerList(7)
          ) : ido ? (
            <View>
              <Text
                style={{fontSize: 16, textAlign: 'center', fontWeight: 'bold'}}>
                {detail_outlet.nama}
              </Text>
              <Text style={{fontSize: 12, textAlign: 'center'}}>
                {detail_outlet.alamat}
              </Text>
              <Text style={{fontSize: 12, textAlign: 'center'}}>
                Telp.{detail_outlet.phone}
              </Text>
              <Divider
                style={{backgroundColor: '#e2e2e2', marginVertical: 10}}
              />
              <View style={[styles.rowsBetween, {marginBottom: 5}]}>
                <Text style={{color: theme.colors.secondary, fontSize: 12}}>
                  ID#{ido}
                </Text>
                <Text style={{color: theme.colors.secondary, fontSize: 12}}>
                  {moment(created_at).format('DD/MM/YYYY HH:mm')}
                </Text>
              </View>
              <View style={styles.rowsBetween}>
                <Text style={{fontWeight: 'bold', fontSize: 12}}>
                  Nama Pelanggan
                </Text>
                <Text style={{fontWeight: 'bold', fontSize: 12}}>
                  {detail_user.name}
                </Text>
              </View>
              <Divider
                style={{
                  backgroundColor: '#e2e2e2',
                  marginTop: 10,
                  marginBottom: 5,
                }}
              />
              <Text style={[styles.textLabel, {marginBottom: 5, fontSize: 13}]}>
                Barang Laundry
              </Text>
              <ListOptions
                options={this.listViewBarang()}
                containerStyle={{
                  paddingHorizontal: 0,
                  paddingVertical: 10,
                  borderTopWidth: 0.5,
                  borderTopColor: '#e2e2e2',
                }}
              />
              <Divider style={[styles.divider, {backgroundColor: '#e2e2e2'}]} />
              <View style={styles.rowsBetween}>
                <Text style={[styles.textLabel, {fontSize: 14}]}>Total</Text>
                <Text style={[styles.textLabel, {fontSize: 14}]}>
                  Rp{this.state.total?.toString().formatNumber()}
                </Text>
              </View>
              <Divider style={[styles.divider, {backgroundColor: '#e2e2e2'}]} />
              <View style={styles.rowsBetween}>
                <Text style={[styles.textLabel, {fontSize: 14}]}>Tunai</Text>
                <Text style={[styles.textLabel, {fontSize: 14}]}>
                  Rp{tunai?.toString().formatNumber()}
                </Text>
              </View>
              <Divider style={[styles.divider, {backgroundColor: '#e2e2e2'}]} />
              <View style={styles.rowsBetween}>
                <Text style={[styles.textLabel, {fontSize: 14}]}>Kembali</Text>
                <Text style={[styles.textLabel, {fontSize: 14}]}>
                  Rp
                  {this.kembalian(tunai)
                    .toString()
                    .formatNumber()}
                </Text>
              </View>
              <Divider style={[styles.divider, {backgroundColor: '#e2e2e2'}]} />
              <View style={styles.rowsBetween}>
                <Text style={[styles.textLabel, {fontSize: 14}]}>
                  Belum Dibayar
                </Text>
                <Text style={[styles.textLabel, {fontSize: 14}]}>
                  Rp
                  {(parseFloat(this.state.total) - parseFloat(pembayaran))
                    .toString()
                    .formatNumber()}
                </Text>
              </View>
              <Divider style={[styles.divider, {backgroundColor: '#e2e2e2'}]} />
              <View style={styles.rowsBetween}>
                <Text style={[styles.textLabel, {fontSize: 14}]}>
                  Status Pembayaran
                </Text>
                <Text style={[styles.textLabel, {fontSize: 14}]}>
                  {this.getStatusPembayaran(this.state.total, pembayaran)}
                </Text>
              </View>
              <Divider style={[styles.divider, {backgroundColor: '#e2e2e2'}]} />
              <View
                style={{
                  flexDirection: 'row',
                  marginVertical: 10,
                  backgroundColor: 'rgba(0,183,255,0.4)',
                  borderRadius: 10,
                  paddingVertical: 7,
                  paddingHorizontal: 10,
                }}>
                <MaterialCommunityIcons
                  name={'information'}
                  size={24}
                  color={theme.colors.primary}
                  style={{alignSelf: 'center'}}
                />
                <Text style={{fontSize: 12, paddingHorizontal: 8}}>
                  Waktu selesai laundry yang tertera pada pembayaran di atas
                  merupakan estimasi waktu tercepat laundry akan kami
                  selesaikan.
                </Text>
              </View>
              <View style={{marginVertical: 10}}>
                <Text style={styles.textLabel}>Parfum</Text>
                <Text style={styles.subtitleList}>
                  {detail.parfum?.nama} ({detail.parfum?.gender},{' '}
                  {detail.parfum?.aroma})
                </Text>
              </View>
              <View style={{marginVertical: 10}}>
                <Text style={styles.textLabel}>Waktu Jemput</Text>
                <Text style={styles.subtitleList}>
                  {moment(detail.tglJemput).format('DD MMMM YYYY')} (
                  {detail.waktuJemput.label} {detail.waktuJemput.mulai} -{' '}
                  {detail.waktuJemput.berakhir})
                </Text>
              </View>
              {detail.tglMasuk && (
                <View style={{marginVertical: 10}}>
                  <Text style={styles.textLabel}>Tanggal Masuk</Text>
                  <Text style={styles.subtitleList}>
                    {moment(detail.tglMasuk).format('DD MMMM YYYY HH:mm')}
                  </Text>
                </View>
              )}
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
                  disabled={isBisaBatalkan}
                  buttonStyle={{borderColor: theme.colors.accent}}
                  titleStyle={{color: theme.colors.accent}}
                  onPress={() => {
                    this.setState({
                      alertVisible: true,
                      batalID: ido,
                      possitiveBtn: () => {
                        this.btnBatalkan();
                        this.setState({alertVisible: false});
                      },
                    });
                  }}
                />
              </View>
            </View>
          ) : null}
        </ViewShot>
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
            onPress: this.state.possitiveBtn,
          }}>
          <Text>{this.state.pesanDialog}</Text>
        </AlertDialog>
      </FlatContainer>
    );
  }
}

export default DetailOrderScreen;
