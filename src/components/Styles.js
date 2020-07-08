import {StyleSheet} from 'react-native';
import {theme} from '../core/theme';

const styles = StyleSheet.create({
  scrollView: {flexGrow: 1, backgroundColor: '#FFF'},
  flatContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#FFF',
  },
  centerContainer: {
    flex: 1,
    padding: 25,
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  textHeader: {
    fontSize: 20,
    color: theme.colors.primary,
    fontWeight: 'bold',
    paddingVertical: 0,
  },
  textSecondary: {
    fontSize: 12,
    lineHeight: 20,
    color: theme.colors.backdrop,
  },
  textLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.secondary,
  },
  fnt_14_secondary: {
    color: '#000',
    fontSize: 14,
  },
  mp_lr_0: {
    paddingLeft: 0,
    marginLeft: 0,
    paddingRight: 0,
    marginRight: 0,
  },
  mp_l_0: {
    paddingLeft: 0,
    marginLeft: 0,
  },
  mp_r_0: {
    paddingRight: 0,
    marginRight: 0,
  },
  ml0_ph10: {
    paddingRight: 15,
    paddingLeft: 0,
    marginLeft: 0,
  },
  chip1: {
    // paddingVertical: 3,
    // paddingHorizontal: 9,
    // paddingLeft: 3,
    marginVertical: 2,
    marginRight: '1%',
    backgroundColor: 'rgba(230,230,230,0.5)',
  },
  titleList: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#000',
  },
  subtitleList: {
    fontSize: 14,
    fontWeight: 'normal',
    color: theme.colors.secondary,
  },
  btnLogout: {
    marginTop: 30,
    height: 50,
    width: '50%',
    alignSelf: 'center',
    borderRadius: 15,
    borderColor: theme.colors.accent,
  },
  divider: {
    height: 1,
    marginVertical: 7,
    backgroundColor: 'transparent',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingTop: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  panelHeader: {
    alignItems: 'center',
  },
  panelHandle: {
    width: 40,
    height: 5,
    borderRadius: 4,
    backgroundColor: '#00000040',
    marginBottom: 10,
  },
  rowsBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default styles;
