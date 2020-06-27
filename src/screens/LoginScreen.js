import React, {memo, useState} from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Text,
  View,
  StatusBar,
} from 'react-native';
import CenterContainer from '../components/CenterContainer';
import Logo from '../components/Logo';
import Button from '../components/Button';
import TextInput from '../components/TextInput';
import {theme} from '../core/theme';
import {emailValidator, passwordValidator} from '../core/utils';
import SInfo from 'react-native-sensitive-info';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import RestApi from '../router/Api';
import {ProgressBar} from '@react-native-community/progress-bar-android';

const LoginScreen = ({navigation}) => {
  SInfo.getItem('token', {}).then(value => {
    if (value) {
      navigation.reset({
        index: 0,
        routes: [{name: 'MainScreen'}],
      });
    }
  });
  const [errorLogin, setErrorLogin] = useState({value: false});
  const [loginProcess, setLoginProcess] = useState({value: false});
  const [email, setEmail] = useState({value: 'tama@tajriy.com', error: ''});
  const [password, setPassword] = useState({
    value: '123456',
    error: '',
  });

  const _onLoginPressed = () => {
    setErrorLogin({value: false});
    setLoginProcess({value: true});
    const emailError = emailValidator(email.value);
    const passwordError = passwordValidator(password.value);

    if (emailError || passwordError) {
      setEmail({...email, error: emailError});
      setPassword({...password, error: passwordError});
      return;
    }

    RestApi.post('/auth/login', {
      email: email.value,
      password: password.value,
    })
      .then(response => {
        const {value, token} = response.data;
        SInfo.setItem('token', token, {});
        SInfo.setItem('name', value.name, {});
        SInfo.setItem('no_hp', value.no_hp, {});
        SInfo.setItem('isMember', value.detail.isMember.toString(), {});

        setLoginProcess({value: false});
        console.log('loginRespon', response.data);
        navigation.reset({
          index: 0,
          routes: [{name: 'MainScreen'}],
        });
      })
      .catch(e => {
        setLoginProcess({value: false});
        setErrorLogin({value: true});
        console.log('loginRespon', e);
      });
  };
  console.info('#render : ', 'LoginScreen.js');

  return (
    <CenterContainer>
      <StatusBar
        barStyle={'dark-content'}
        backgroundColor={theme.colors.white}
      />
      <Logo />
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
            Email atau password salah, silahkan periksa kembali
          </Text>
        </View>
      ) : null}
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
        onChangeText={text => {
          setPassword({value: text, error: ''});
          setErrorLogin({value: false});
        }}
        error={!!password.error}
        errorText={password.error}
        secureTextEntry
      />

      <View style={styles.forgotPassword}>
        <TouchableOpacity
          style={{flexDirection: 'row'}}
          onPress={() => navigation.navigate('ForgotPasswordScreen')}>
          <Text style={styles.label}>Lupa password ? </Text>
          <Text style={{color: 'green'}}>Klik Disini</Text>
        </TouchableOpacity>
      </View>

      {loginProcess.value ? (
        <ProgressBar
          style={{width: '100%'}}
          styleAttr="Horizontal"
          color={theme.colors.primary}
        />
      ) : (
        <Button mode="contained" onPress={_onLoginPressed}>
          Login
        </Button>
      )}

      <View style={styles.row}>
        <Text style={styles.label}>Belum punya akun? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('RegisterScreen')}>
          <Text style={styles.link}>Daftar Sekarang</Text>
        </TouchableOpacity>
      </View>
    </CenterContainer>
  );
};

const styles = StyleSheet.create({
  forgotPassword: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    marginTop: 4,
  },
  label: {
    color: theme.colors.secondary,
  },
  link: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
});

export default memo(LoginScreen);
