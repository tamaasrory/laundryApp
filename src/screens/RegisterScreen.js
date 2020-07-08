import React, {memo, useState} from 'react';
import {View, StyleSheet, TouchableOpacity, StatusBar} from 'react-native';
import TextInput from '../components/TextInput';
import {theme} from '../core/theme';
import {
  emailValidator,
  passwordValidator,
  nameValidator,
  noHpValidator,
} from '../core/utils';
import RestApi from '../router/Api';
import {Text, Button} from 'react-native-elements';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {ProgressBar} from '@react-native-community/progress-bar-android';
import styles from '../components/Styles';
import FlatContainer from '../components/FlatContainer';

const RegisterScreen = ({navigation}) => {
  const [name, setName] = useState({value: '', error: ''});
  const [email, setEmail] = useState({value: '', error: ''});
  const [noHp, setNoHp] = useState({value: '', error: ''});
  const [password, setPassword] = useState({value: '', error: ''});
  const [errorLogin, setErrorLogin] = useState({value: false});
  const [loginProcess, setLoginProcess] = useState({value: false});

  const _onSignUpPressed = () => {
    setErrorLogin({value: false});
    setLoginProcess({value: true});
    const nameError = nameValidator(name.value);
    const emailError = emailValidator(email.value);
    const noHpError = noHpValidator(noHp.value);
    const passwordError = passwordValidator(password.value);

    if (emailError || passwordError || nameError || noHpError) {
      setName({...name, error: nameError});
      setEmail({...email, error: emailError});
      setNoHp({...noHp, error: noHpError});
      setPassword({...password, error: passwordError});
      setLoginProcess({value: false});
    } else {
      RestApi.post('/user/baru', {
        name: name.value,
        email: email.value,
        no_hp: noHp.value,
        password: password.value,
      })
        .then(response => {
          console.log('loginRespon', response);
          setLoginProcess({value: false});
          navigation.navigate('LoginScreen');
        })
        .catch(e => {
          setLoginProcess({value: false});
          setErrorLogin({value: true});
          console.log('loginRespon', e);
        });
    }
  };
  console.info('#render : ', 'RegisterScreen.js');
  return (
    <View style={{backgroundColor: '#fff', flexGrow: 1}}>
      <StatusBar
        barStyle={'light-content'}
        backgroundColor={theme.colors.primary}
      />
      <View
        style={{
          flexDirection: 'row',
          paddingVertical: 8,
          elevation: 4,
          backgroundColor: theme.colors.primary,
        }}>
        <Button
          type={'clear'}
          onPress={() => navigation.goBack()}
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
          <Text style={[styles.textHeader, {color: '#fff'}]}>Registrasi</Text>
          <Text style={[styles.textSecondary, {color: '#fff', marginTop: -3}]}>
            Lengkapi data kamu untuk mendaftar
          </Text>
        </View>
      </View>

      <View style={{flex: 1, height: 100}}>
        <FlatContainer style={{paddingHorizontal: 25, paddingTop: 10}}>
          {errorLogin.value ? (
            <View
              style={{
                flexDirection: 'row',
                marginHorizontal: 15,
              }}>
              <MaterialCommunityIcons
                name={'information'}
                size={20}
                color={theme.colors.accent}
                style={{marginRight: '2%'}}
              />
              <Text style={{color: theme.colors.accent}}>
                Email sudah pernah digunakan, silahkan login atau periksa
                kembali email anda
              </Text>
            </View>
          ) : null}
          <TextInput
            label="Nama"
            returnKeyType="next"
            value={name.value}
            onChangeText={text => setName({value: text, error: ''})}
            error={!!name.error}
            errorText={name.error}
          />

          <TextInput
            label="Email"
            returnKeyType="next"
            value={email.value}
            onChangeText={text => {
              setEmail({value: text, error: ''});
              setErrorLogin({value: false});
            }}
            error={!!email.error}
            errorText={email.error}
            autoCapitalize="none"
            autoCompleteType="email"
            textContentType="emailAddress"
            keyboardType="email-address"
          />

          <TextInput
            label="Password"
            returnKeyType="done"
            value={password.value}
            onChangeText={text => setPassword({value: text, error: ''})}
            error={!!password.error}
            errorText={password.error}
            secureTextEntry
          />

          <TextInput
            label="Nomor Ponsel"
            returnKeyType="next"
            value={noHp.value}
            onChangeText={text => setNoHp({value: text, error: ''})}
            error={!!noHp.error}
            errorText={noHp.error}
            autoCapitalize="none"
          />

          {loginProcess.value ? (
            <ProgressBar
              style={{width: '100%'}}
              styleAttr="Horizontal"
              color={theme.colors.primary}
            />
          ) : (
            <Button
              type={'solid'}
              title={'DAFTAR'}
              buttonStyle={styles1.button}
              onPress={_onSignUpPressed}
            />
          )}

          <View style={styles1.row}>
            <Text style={styles1.label}>Sudah punya akun? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('LoginScreen')}>
              <Text style={styles1.link}>Login Sekarang</Text>
            </TouchableOpacity>
          </View>
        </FlatContainer>
      </View>
    </View>
  );
};

const styles1 = StyleSheet.create({
  label: {
    color: theme.colors.secondary,
  },
  button: {
    marginTop: 24,
    marginBottom: 10,
    backgroundColor: theme.colors.primary,
  },
  row: {
    flexDirection: 'row',
    marginTop: 4,
  },
  link: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
});

export default memo(RegisterScreen);
