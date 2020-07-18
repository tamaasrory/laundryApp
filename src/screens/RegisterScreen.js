import React, {memo, useState} from 'react';
import {StatusBar, StyleSheet, TouchableOpacity, View} from 'react-native';
import TextInput from '../components/TextInput';
import {theme} from '../core/theme';
import {
  emailValidator,
  nameValidator,
  noHpValidator,
  passwordValidator,
} from '../core/utils';
import RestApi from '../router/Api';
import {Button, Text} from 'react-native-elements';
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

  function checkValidation() {
    return !!(
      name.error ||
      email.error ||
      noHp.error ||
      password.error ||
      !(name.value && email.value && noHp.value && password.value)
    );
  }

  const _onSignUpPressed = () => {
    setErrorLogin({value: false});
    setLoginProcess({value: true});

    if (name.error || email.error || noHp.error || password.error) {
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

      <View style={{flex: 1}}>
        <FlatContainer
          nested={true}
          style={{paddingHorizontal: 25, paddingTop: 10}}>
          {errorLogin.value ? (
            <View
              style={{
                flexDirection: 'row',
                paddingHorizontal: 10,
                marginVertical: 10,
                paddingVertical: 7,
                borderRadius: 7,
                backgroundColor: 'rgba(241,58,89,0.23)',
              }}>
              <MaterialCommunityIcons
                name={'information'}
                size={24}
                color={theme.colors.accent}
                style={{alignSelf: 'center'}}
              />
              <Text
                style={{
                  color: theme.colors.accent,
                  fontSize: 12,
                  marginHorizontal: 10,
                }}>
                Email sudah pernah digunakan, silahkan login atau periksa
                kembali email anda!
              </Text>
            </View>
          ) : null}
          <View style={{zIndex: 1000, backgroundColor: '#fff'}}>
            <TextInput
              label="Nama"
              returnKeyType="next"
              value={name.value}
              onChangeText={text => {
                const namaError = nameValidator(text);
                setName({value: text, error: namaError ? namaError : ''});
              }}
              error={!!name.error}
              errorText={name.error}
            />

            <TextInput
              label="Email"
              returnKeyType="next"
              value={email.value}
              onChangeText={text => {
                const emailError = emailValidator(text);
                setEmail({value: text, error: emailError ? emailError : ''});
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
                const passError = passwordValidator(text);
                setPassword({value: text, error: passError ? passError : ''});
              }}
              error={!!password.error}
              errorText={password.error}
              maxLength={8}
              secureTextEntry
            />

            <TextInput
              label="Nomor Ponsel"
              returnKeyType="next"
              keyboardType={'number-pad'}
              value={noHp.value}
              onChangeText={text => {
                const noHpError = noHpValidator(text);
                setNoHp({value: text, error: noHpError ? noHpError : ''});
              }}
              error={!!noHp.error}
              errorText={noHp.error}
              autoCapitalize="none"
            />
          </View>
          <View
            style={{
              alignSelf: 'center',
              marginBottom: 25,
              position: 'absolute',
              bottom: 0,
              width: '100%',
              zIndex: 100,
            }}>
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
                disabled={checkValidation()}
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
    alignSelf: 'center',
    marginTop: 4,
  },
  link: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
});

export default memo(RegisterScreen);
