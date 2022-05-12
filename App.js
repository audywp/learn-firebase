import {View, Text, TouchableOpacity, Alert} from 'react-native';
import React, {useEffect, useState} from 'react';
import crashlytics from '@react-native-firebase/crashlytics';
import analytics from '@react-native-firebase/analytics';

import messaging from '@react-native-firebase/messaging';
import axios from 'axios';
import {firebaseService} from './src/utils/api';

import MapView, {Polyline} from 'react-native-maps';

import {check, PERMISSIONS, RESULTS, request} from 'react-native-permissions';

import Geolocation from '@react-native-community/geolocation';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {AccessToken, LoginButton} from 'react-native-fbsdk-next';

Geolocation.setRNConfiguration({
  enableHighAccuracy: false,
  timeout: 5000,
  maximumAge: 10000,
});

GoogleSignin.configure({
  webClientId:
    '85302093873-akfb6mbgs98c48sl687p9s5dvs7djtrr.apps.googleusercontent.com',
});

export default function App() {
  const [totalMessage, setTotalMessage] = useState(0);
  const [tokenState, setToken] = useState('');
  const [position, setPosition] = useState({});

  const requestPermissions = React.useCallback(async () => {
    const result = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
    console.log(result);
    switch (result) {
      case RESULTS.UNAVAILABLE:
        console.log(
          'This feature is not available (on this device / in this context)',
        );
        break;
      case RESULTS.DENIED:
        const resRequest = await request(
          PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        );
        console.log(resRequest);
        console.log(
          'The permission has not been requested / is denied but requestable',
        );
        break;
      case RESULTS.LIMITED:
        console.log('The permission is limited: some actions are possible');
        break;
      case RESULTS.GRANTED:
        console.log('The permission is granted');
        break;
      case RESULTS.BLOCKED:
        console.log('The permission is denied and not requestable anymore');
        break;
    }
  }, []);

  useEffect(() => {
    crashlytics().log('App mounted.');
    requestPermissions();
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      setTotalMessage(totalMessage + 1);
    });

    Geolocation.getCurrentPosition(info => {
      console.log(info);
      setPosition({
        lat: info.coords.latitude,
        long: info.coords.longitude,
      });
    });

    return unsubscribe;
  }, [totalMessage, requestPermissions]);

  const _signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.log(userInfo);
    } catch (error) {
      console.log(error);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
      } else {
        // some other error happened
      }
    }
  };

  return (
    <View>
      <TouchableOpacity
        onPress={() => {
          crashlytics().log('button clicked');
          crashlytics().crash();
        }}>
        <Text>Click for crash</Text>
      </TouchableOpacity>
      <Text>Total Messages {totalMessage} </Text>
      <TouchableOpacity
        onPress={async () => {
          await analytics().logEvent('register_account', {
            name: 'audy',
          });
        }}>
        <Text>Register</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={async () => {
          const body = {
            to: 'dOQ9k0JRRqOnk3hAykpQw4:APA91bFgNlfK7OhjODXYqMbuy_bP9A-KTCIOSN-on2Pia72jvm51CfdqhCffVzzQldOonM2C8L3c8DJZAOkiYTkTkVU7t_uyHoOl84-WoWL9e27ws109kp2Qj7qlCipcrNGpRtgH3utf',
            notification: {
              body: 'New Lesson Added 1',
              title: 'Lokesh',
            },
          };

          const res = await axios.post(`${firebaseService}`, body, {
            headers: {
              Authorization: `Bearer AAAAE9xmqDE:APA91bHJ63LZmZHbpdWC_GtfNZrvqCxQyXs_Um9M1Alds5gPxoA5qMpdKI4-wvoFCtZZk-zCMcBhauCvU3Z6-nhn9PUs8ot3oZTwKyzPGSXbRQRrhAqStARe9tV9kh_QNs0GCY3nuimY`,
            },

            validateStatus: status => status < 505,
          });

          console.log(res);
        }}>
        <Text>testing notif</Text>
      </TouchableOpacity>
      <MapView style={{width: 400, height: 400}}>
        <Polyline
          coordinates={[
            {latitude: 37.8025259, longitude: -122.4351431},
            {latitude: 37.7896386, longitude: -122.421646},
            {latitude: 37.7665248, longitude: -122.4161628},
            {latitude: 37.7734153, longitude: -122.4577787},
            {latitude: 37.7948605, longitude: -122.4596065},
            {latitude: 37.8025259, longitude: -122.4351431},
          ]}
          strokeColor="#000" // fallback for when `strokeColors` is not supported by the map-provider
          strokeColors={[
            '#7F0000',
            '#00000000', // no color, creates a "long" gradient between the previous and next coordinate
            '#B24112',
            '#E5845C',
            '#238C23',
            '#7F0000',
          ]}
          strokeWidth={6}
        />
      </MapView>
      <GoogleSigninButton
        style={{width: 192, height: 48}}
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Dark}
        onPress={_signIn}
        // disabled={this.state.isSigninInProgress}
      />
      <LoginButton
        onLoginFinished={(error, result) => {
          if (error) {
            console.log('login has error: ' + result.error);
          } else if (result.isCancelled) {
            console.log('login is cancelled.');
          } else {
            AccessToken.getCurrentAccessToken().then(data => {
              console.log(data.accessToken.toString());
            });
          }
        }}
        onLogoutFinished={() => console.log('logout.')}
      />
    </View>
  );
}
