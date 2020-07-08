/**
 * @flow strict-local
 */
import React, {memo} from 'react';
import FlatContainer from '../components/FlatContainer';
import {Button, ListItem, Text} from 'react-native-elements';
import {theme} from '../core/theme';
import ListViewItem from '../components/ListViewItem';
import styles from '../components/Styles';
import RestApi from '../router/Api';
import SInfo from 'react-native-sensitive-info';
import User from '../store/User';
import {ActivityIndicator, StatusBar, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

class AccountScreen extends React.PureComponent {
  state = {
    alertVisible: false,
    listData: [],
    onUpgradeProgress: false,
    member_status: false,
    request_upgrade_to_member: false,
    account_name: null,
    no_hp: null,
    email: null,
    btnUpgradeTitle: 'Upgrade Jadi Member',
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
    const {
      getName,
      getNoHp,
      getEmail,
      isMember,
      request_upgrade_to_member,
    } = new User();
    let member_status = (await isMember()) === '1';
    let request_upgrade_to_member_ =
      (await request_upgrade_to_member()) === '1';
    this.setState({
      account_name: await getName(),
      no_hp: await getNoHp(),
      email: await getEmail(),
      member_status: member_status,
      request_upgrade_to_member: request_upgrade_to_member_,
      btnUpgradeTitle: request_upgrade_to_member_
        ? 'Menunggu Konfirmasi'
        : 'Upgrade Jadi Member',
    });
  }

  loadingData() {
    RestApi.get('/user/detail')
      .then(res => {
        const {value} = res.data;
        let member_status = value.detail.isMember.toString() === '1';
        let request_upgrade_to_member =
          value.detail.request_upgrade_to_member.toString() === '1';
        this.setState({
          account_name: value.name,
          no_hp: value.no_hp,
          email: value.email,
          member_status: member_status,
          request_upgrade_to_member: request_upgrade_to_member,
          btnUpgradeTitle: request_upgrade_to_member
            ? 'Menunggu Konfirmasi'
            : 'Upgrade Jadi Member',
        });

        SInfo.setItem('name', value.name, {});
        SInfo.setItem('no_hp', value.no_hp, {});
        SInfo.setItem('email', value.email, {});
        SInfo.setItem('isMember', value.detail.isMember.toString(), {});
        SInfo.setItem(
          'request_upgrade_to_member',
          value.detail.request_upgrade_to_member.toString(),
          {},
        );
      })
      .catch(error => {
        console.log('error account', error);
      });
  }

  postUpgradeToMember = () => {
    this.setState({
      onUpgradeProgress: true,
      btnUpgradeTitle: 'Mengirim Permintaan',
    });
    RestApi.post('/user/upgrade-to-member')
      .then(res => {
        SInfo.setItem('request_upgrade_to_member', '1', {});
        this.setState({
          onUpgradeProgress: false,
          btnUpgradeTitle: 'Menunggu Konfirmasi',
          request_upgrade_to_member: true,
        });
        console.log('Menunggu Konfirmasi');
      })
      .catch(error => {
        this.setState({
          onUpgradeProgress: false,
          request_upgrade_to_member: false,
          btnUpgradeTitle: 'Upgrade Jadi Member',
        });
        console.log('error upgrade', error);
      });
  };

  render() {
    console.info('#render : ', this.constructor.name);
    const {
      member_status,
      account_name,
      no_hp,
      email,
      btnUpgradeTitle,
      request_upgrade_to_member,
    } = this.state;
    return (
      <View style={{flexGrow: 1, backgroundColor: '#fff'}}>
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
            <ListItem
              underlayColor={'rgba(202,202,202,0.58)'}
              leftIcon={
                <MaterialCommunityIcons
                  name={'account-circle'}
                  size={24}
                  color={theme.colors.primary}
                />
              }
              title={<Text style={{fontWeight: 'bold'}}>Nama</Text>}
              subtitle={account_name}
              titleStyle={styles.titleList}
              subtitleStyle={styles.subtitleList}
              bottomDivider
            />
            <ListItem
              underlayColor={'rgba(202,202,202,0.58)'}
              leftIcon={
                <MaterialCommunityIcons
                  name={'email'}
                  size={24}
                  color={theme.colors.primary}
                />
              }
              title={<Text style={{fontWeight: 'bold'}}>Email</Text>}
              subtitle={email}
              titleStyle={styles.titleList}
              subtitleStyle={styles.subtitleList}
              bottomDivider
            />
            <ListItem
              underlayColor={'rgba(202,202,202,0.58)'}
              leftIcon={
                <MaterialCommunityIcons
                  name={'phone'}
                  size={24}
                  color={theme.colors.primary}
                />
              }
              title={<Text style={{fontWeight: 'bold'}}>Nomor Ponsel</Text>}
              subtitle={no_hp}
              titleStyle={styles.titleList}
              subtitleStyle={styles.subtitleList}
              bottomDivider
            />
            <ListItem
              underlayColor={'rgba(202,202,202,0.58)'}
              leftIcon={
                <MaterialCommunityIcons
                  name={'wallet-membership'}
                  size={24}
                  color={theme.colors.primary}
                />
              }
              title={<Text style={{fontWeight: 'bold'}}>Status</Text>}
              subtitle={member_status ? 'Member' : 'Bukan Member'}
              titleStyle={styles.titleList}
              subtitleStyle={styles.subtitleList}
              rightElement={
                member_status ? null : (
                  <Button
                    type={'outline'}
                    title={btnUpgradeTitle}
                    disabled={request_upgrade_to_member}
                    icon={
                      this.state.onUpgradeProgress ? (
                        <ActivityIndicator
                          animating={true}
                          color={theme.colors.green}
                          style={{marginRight: 5}}
                        />
                      ) : null
                    }
                    titleStyle={{color: theme.colors.green, fontSize: 11}}
                    onPress={this.postUpgradeToMember}
                    buttonStyle={{
                      borderRadius: 10,
                      borderColor: theme.colors.green,
                    }}
                  />
                )
              }
              bottomDivider
            />
            <ListViewItem data={this.listInfo} />
          </FlatContainer>
          <Button
            type="outline"
            buttonStyle={styles.btnLogout}
            titleStyle={{color: theme.colors.accent}}
            containerStyle={{marginBottom: 20}}
            onPress={() => {
              // this.setState({alertVisible: false});
              SInfo.deleteItem('token', {});
              SInfo.deleteItem('name', {});
              SInfo.deleteItem('email', {});
              SInfo.deleteItem('no_hp', {});
              SInfo.deleteItem('isMember', {});
              SInfo.deleteItem('request_upgrade_to_member', {});
              this.props.navigation.reset({
                index: 0,
                routes: [{name: 'LoginScreen'}],
              });
            }}
            title="KELUAR"
          />
        </View>
      </View>
    );
  }
}

export default memo(AccountScreen);
