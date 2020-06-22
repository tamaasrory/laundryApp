/**
 * @flow strict-local
 */
import React, {memo} from 'react';
import FlatContainer from '../components/FlatContainer';
import {Button, Text} from 'react-native-elements';
import {theme} from '../core/theme';
import ListViewItem from '../components/ListViewItem';
import styles from '../components/Styles';
// import AlertDialog from '../components/AlertDialog';
import RestApi from '../router/Api';
import SInfo from 'react-native-sensitive-info';
import User from '../store/User';
import {StatusBar, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

class AccountScreen extends React.PureComponent {
  state = {
    alertVisible: false,
    listData: [],
  };

  listInfo = [
    {
      icon: {name: 'information', color: '#ffb700'},
      title: 'Persyaratan Member',
      onPress: () => {
        this.props.navigation.navigate('SyaratMemberScreen');
      },
      subtitle: null,
    },
    {
      icon: {name: 'comment-question', color: '#00aa2f'},
      title: 'Keuntungan Member',
      onPress: () => {
        this.props.navigation.navigate('KeuntunganScreen');
      },
      subtitle: null,
    },
  ];

  constructor(props) {
    super(props);
    this.initData();
  }

  async initData() {
    const {getName, getNoHp, isMember} = new User();
    this.setState({
      listData: [
        {
          icon: {name: 'account-circle'},
          title: <Text style={{fontWeight: 'bold'}}>Nama</Text>,
          subtitle: await getName(),
        },
        {
          icon: {name: 'phone'},
          title: <Text style={{fontWeight: 'bold'}}>Nomor Ponsel</Text>,
          subtitle: await getNoHp(),
        },
        {
          icon: {name: 'wallet-membership'},
          title: <Text style={{fontWeight: 'bold'}}>Status</Text>,
          subtitle: (await isMember()) === '1' ? 'Member' : 'Belum Jadi Member',
        },
      ],
    });
  }
  loadingData() {
    RestApi.get('/user/detail')
      .then(res => {
        const {value} = res.data;
        this.setState({
          listData: [
            {
              icon: {name: 'account-circle'},
              title: 'Nama',
              subtitle: value.name,
            },
            {
              icon: {name: 'phone'},
              title: 'Nomor Ponsel',
              subtitle: value.no_hp,
            },
            {
              icon: {name: 'wallet-membership'},
              title: 'Status',
              subtitle:
                value.detail.isMember.toString() === '1'
                  ? 'Member'
                  : 'Belum Jadi Member',
            },
          ],
        });

        SInfo.setItem('name', value.name, {});
        SInfo.setItem('no_hp', value.no_hp, {});
        SInfo.setItem('isMember', value.detail.isMember.toString(), {});
      })
      .catch(error => {
        console.log('error account', error);
      });
  }

  render() {
    console.info('#render : ', this.constructor.name);
    return (
      <View style={{flexGrow: 1}}>
        <StatusBar
          backgroundColor={theme.colors.tabAccountStatusBar}
          barStyle={'dark-content'}
        />
        <View
          style={{
            flexDirection: 'row',
            paddingVertical: 8,
            elevation: 4,
            backgroundColor: theme.colors.tabAccount,
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
              Akun
            </Text>
            <Text
              style={[
                styles.textSecondary,
                {color: theme.colors.textToolBar, marginTop: -5},
              ]}>
              Detail profile kamu ada disini
            </Text>
          </View>
        </View>
        <View
          style={{
            flex: 1,
            height: 100,
          }}>
          <FlatContainer
            style={{padding: 0}}
            onRefresh={() => this.loadingData()}>
            <ListViewItem data={this.state.listData} />
            <ListViewItem data={this.listInfo} />
            {/*<AlertDialog
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
                  this.setState({alertVisible: false});
                  SInfo.deleteItem('token', {});
                  SInfo.deleteItem('name', {});
                  SInfo.deleteItem('no_hp', {});
                  SInfo.deleteItem('isMember', {});
                  this.props.navigation.navigate('LoginScreen');
                },
              }}>
              <Text>Anda yakin akan keluar ?</Text>
            </AlertDialog>*/}
            <Button
              type="outline"
              buttonStyle={styles.btnLogout}
              titleStyle={{color: theme.colors.accent}}
              onPress={() => {
                // this.setState({alertVisible: false});
                SInfo.deleteItem('token', {});
                SInfo.deleteItem('name', {});
                SInfo.deleteItem('no_hp', {});
                SInfo.deleteItem('isMember', {});
                this.props.navigation.reset({
                  index: 0,
                  routes: [{name: 'LoginScreen'}],
                });
              }}
              title="KELUAR"
            />
          </FlatContainer>
        </View>
      </View>
    );
  }
}

export default memo(AccountScreen);
