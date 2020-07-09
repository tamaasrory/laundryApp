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
import moment from '../components/DateFormater';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';

@inject('orderStore')
@observer
class ProgressScreen extends React.PureComponent {
  screenHeight = 0;
  bs = React.createRef();
  state = {
    listData: [],

    selectedTransaksi: null,
    selectedKategori: null,

    bsMaxHeight: 0,
    bsMidHeight: 0,
    alertVisible: false,
    pesanDialog: 'Batalkan Order Laundry Sekarang ?',
    possitiveBtn: () => {},
    negativeBtn: () => {},
    batalID: null,
    openBs: false,

    isLoading: true,
    errorLoadingData: false,
  };

  constructor(props) {
    super(props);
    this.loadingData();
  }

  loadingData() {
    this.setState({isLoading: true, errorLoadingData: false});
    RestApi.get('/order/onprogress')
      .then(res => {
        this.setState({
          listData: res.data.value,
          isLoading: false,
          errorLoadingData: false,
        });
        console.log('res', res);
      })
      .catch(err => {
        console.log('error res', err);
        this.setState({listData: [], isLoading: false, errorLoadingData: true});
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
          <Text
            style={[
              styles.titleList,
              {color: theme.colors.secondary, fontSize: 13, fontWeight: 'bold'},
            ]}>
            {d.name}
          </Text>
        ),
        subtitle: (
          <View>
            <Text
              style={[
                styles.titleList,
                {color: theme.colors.secondary, fontSize: 12},
              ]}>
              {selectedKat.name} ({selectedKat.waktuPengerjaan} Jam)
            </Text>
            <Text
              style={[
                styles.titleList,
                {
                  color: this.getStatusColor(status.label),
                  marginTop: 2,
                  fontSize: 12,
                },
              ]}>
              {status.label}
            </Text>
            {selectedKat.waktuPengantaran ? (
              <Text style={{fontSize: 11, color: theme.colors.backdrop}}>
                Akan diantar {selectedKat.waktuPengantaran}
              </Text>
            ) : null}
          </View>
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
            <Text style={[styles.subtitleList, {textAlign: 'right'}]}>
              {selectedKat.harga.toString().formatNumber()} (x{d.jumlah})
            </Text>
            {![
              'Menunggu',
              'Dibatalkan',
              'Sedang Dijemput',
              'Sedang Dilaundry',
              'Telah Diterima',
            ].includes(status.label) ? (
              <Button
                type={'outline'}
                title={'Telah Diterima'}
                titleStyle={{
                  fontSize: 12,
                  color: this.getStatusColorByKey(7),
                }}
                onPress={() => {
                  this.setState({
                    pesanDialog:
                      'Apakah Benar anda telah menerima barang yang anda laundry?',
                    possitiveBtn: () => this.postTerimaLaundry(d.idk),
                    alertVisible: true,
                  });
                }}
                buttonStyle={{
                  paddingVertical: 5,
                  marginTop: 2,
                  borderRadius: 15,
                  borderColor: this.getStatusColorByKey(7),
                }}
              />
            ) : null}
          </View>
        ),
      });
    });

    return kategori;
  }

  postTerimaLaundry(idk) {
    const oldPesan = this.state.pesanDialog;
    RestApi.post('/order/terima', {
      id: this.state.selectedTransaksi.ido,
      idk: idk,
    })
      .then(res => {
        console.log(res.data.value);
        this.bs.current.snapTo(2);
        this.loadingData();
        this.setState({
          alertVisible: false,
          pesanDialog: oldPesan,
          openBs: false,
        });
      })
      .catch(error => {
        console.log(error);
        this.bs.current.snapTo(2);
        this.setState({
          alertVisible: false,
          pesanDialog: oldPesan,
          openBs: false,
        });
      });
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
      pembayaran,
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
            borderTopWidth: 0.5,
            borderTopColor: '#e2e2e2',
          }}
        />
        <Divider style={[styles.divider, {backgroundColor: '#e2e2e2'}]} />
        <View style={styles.rowsBetween}>
          <Text style={[styles.textLabel, {fontSize: 15}]}>Total</Text>
          <Text style={[styles.textLabel, {fontSize: 15}]}>
            Rp{total.toString().formatNumber()}
          </Text>
        </View>
        <Divider style={[styles.divider, {backgroundColor: '#e2e2e2'}]} />
        <View style={styles.rowsBetween}>
          <Text style={[styles.textLabel, {fontSize: 15}]}>Tunai</Text>
          <Text style={[styles.textLabel, {fontSize: 15}]}>
            Rp{pembayaran.toString().formatNumber()}
          </Text>
        </View>
        <Divider style={[styles.divider, {backgroundColor: '#e2e2e2'}]} />
        <View style={styles.rowsBetween}>
          <Text style={[styles.textLabel, {fontSize: 15}]}>Belum Dibayar</Text>
          <Text style={[styles.textLabel, {fontSize: 15}]}>
            Rp
            {(parseFloat(total) - parseFloat(pembayaran))
              .toString()
              .formatNumber()}
          </Text>
        </View>
        <Divider style={[styles.divider, {backgroundColor: '#e2e2e2'}]} />
        <View
          style={{
            flexDirection: 'row',
            marginVertical: 10,
            backgroundColor: 'rgba(0,183,255,0.38)',
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
          <Text style={{fontSize: 12, marginLeft: 5, marginRight: 15}}>
            Waktu pengantaran yang tertera pada pembayaran di atas merupakan
            estimasi tercepat
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
    );
  }

  btnBatalkan() {
    const oldPesan = this.state.pesanDialog;
    this.setState({
      pesanDialog: 'Sedang Membatalkan Orderan Anda',
    });
    RestApi.post('/order/batalkan', {id: this.state.batalID})
      .then(response => {
        this.setState({batalID: null, pesanDialog: oldPesan, openBs: false});
        this.bs.current.snapTo(2);
        this.loadingData();
      })
      .catch(e => {
        this.setState({batalID: null, openBs: false});
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
      Menunggu: '#ff005a', // Menunggu
      Dibatalkan: '#737373', // Dibatalkan
      'Sedang Dijemput': '#ff8e00', // Sedang Dijemput
      'Sedang Dilaundry': '#009aff', // Sedang Dilaundry
      'Laundry Selesai': '#00aa2f', // Laundry Selesai
      'Sedang Diantar': '#ff8e00', // Sedang Diantar
      'Telah Diterima': '#00aa2f', // Telah Diterima
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
    ];
    return status[key - 1];
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
            paddingHorizontal: 15,
            borderBottomWidth: 0.5,
            borderBottomColor: '#ddd',
          }}>
          <View style={{alignSelf: 'center'}}>
            <ShimmerPlaceHolder
              autoRun={true}
              style={{
                width: '40%',
                height: 20,
                marginBottom: 7,
                borderRadius: 10,
              }}
            />
            <ShimmerPlaceHolder
              autoRun={true}
              style={{
                width: '65%',
                height: 15,
                borderRadius: 10,
              }}
            />
          </View>
          <ShimmerPlaceHolder
            autoRun={true}
            style={{
              width: '30%',
              height: 20,
              alignSelf: 'center',
              borderRadius: 10,
            }}
          />
        </View>,
      );
    }
    return <View style={{backgroundColor: '#fff'}}>{shimmerRows}</View>;
  }

  render() {
    console.info('#render : ', 'HistoryScreen.js');
    const {listData, bsMaxHeight, bsMidHeight, errorLoadingData} = this.state;
    return (
      <View
        onLayout={event => {
          this.screenHeight = event.nativeEvent.layout.height;
        }}
        style={{flexGrow: 1}}>
        <StatusBar
          backgroundColor={theme.colors.tabProgressStatusBar}
          barStyle={'light-content'}
        />
        <View
          style={{
            flexDirection: 'row',
            paddingVertical: 8,
            backgroundColor: theme.colors.tabProgress,
          }}>
          <Button
            type={'clear'}
            onPress={() => this.props.navigation.goBack()}
            containerStyle={{justifyContent: 'center'}}
            icon={
              <MaterialCommunityIcons
                name={'arrow-left'}
                size={28}
                color={'white'}
              />
            }
          />
          <View
            style={{
              flexDirection: 'column',
              justifyContent: 'center',
              paddingHorizontal: 15,
            }}>
            <Text style={[styles.textHeader, {color: '#fff'}]}>
              Sedang Diproses
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
            {this.state.isLoading ? (
              this._renderShimmerList(7)
            ) : listData.length === 0 ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  paddingHorizontal: 35,
                }}>
                <Text style={{textAlign: 'center', color: '#b9b9b9'}}>
                  {errorLoadingData
                    ? 'Sepertinya ada masalah jaringan, coba periksa jaringan atau paket data kamu'
                    : 'Kamu belum pernah pesan laundry jadi belum ada riwayat pesanan disini, ayo laundry sekarang!'}
                </Text>
              </View>
            ) : (
              listData.map((list, i) => {
                let totalLaundry = 0;
                list.detail.barang.forEach(d => {
                  totalLaundry += this.total(
                    d,
                    d.selectedKategori,
                    d.jumlah,
                    list.detail.isMember,
                  );
                });

                let tmpTotalLaundry = totalLaundry;
                totalLaundry = totalLaundry.toString().formatNumber();
                return (
                  <ListItem
                    key={i}
                    underlayColor={'rgba(0,0,0,0.14)'}
                    onPress={() => this.showBottomSheet(i, tmpTotalLaundry)}
                    title={null}
                    // titleStyle={[styles.titleList, {fontSize: 13, color: 'grey'}]}
                    subtitle={
                      <View style={{flexDirection: 'column'}}>
                        <Text style={{fontSize: 20}}>Rp{totalLaundry}</Text>
                        <View style={{flexDirection: 'row'}}>
                          <Text style={{fontSize: 12}}>
                            {moment(list.created_at).format('DD/MM/YYYY')}
                          </Text>
                          <Text style={{fontSize: 12, color: 'grey'}}>
                            &nbsp;&mdash;&nbsp;{list.ido}
                          </Text>
                        </View>
                      </View>
                    }
                    containerStyle={{paddingVertical: 15}}
                    subtitleStyle={styles.subtitleList}
                    rightElement={
                      <View style={{flexDirection: 'column'}}>
                        <Button
                          type={'outline'}
                          title={this.getStatusLabel(list.status).toUpperCase()}
                          titleStyle={{
                            fontSize: 12,
                            color: this.getStatusColorByKey(list.status),
                          }}
                          buttonStyle={{
                            paddingVertical: 3,
                            borderRadius: 15,
                            borderColor: this.getStatusColorByKey(list.status),
                          }}
                        />
                      </View>
                    }
                    bottomDivider
                  />
                );
              })
            )}
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
            onPress: this.state.possitiveBtn,
          }}>
          <Text>{this.state.pesanDialog}</Text>
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

export default ProgressScreen;
