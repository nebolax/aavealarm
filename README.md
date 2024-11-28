# Aave Alarm
Mobile app that tracks your aave positions and notifies you of low health factor and liquidations. 400 positions are being tracked and growing!

**Due to Aave Grants shutting down and the developer of this app having issues with Google Play and App Store, it's no longer possible to download the app.**

## Download it

Google Play Store: https://play.google.com/store/apps/details?id=com.aavealarm&pcampaignid=web_share

Apple App Store: https://apps.apple.com/am/app/aave-alarm/id6454900102 WARNING! Apple has banned the developer account that was used to publish Aave Alarm (nothing else was publushed from that account), so Aave Alarm is no longer available on iOS.

## Screenshots
1   |2   |3
----|----|----
![screenshot1](https://github.com/nebolax/aavealarm/assets/63492346/3dd38ad5-85ec-407f-b344-e25b042e2fdf)|![screenshot2](https://github.com/nebolax/aavealarm/assets/63492346/a76ba173-51c0-4528-9274-9fa1d03b6248)|![screenshot3](https://github.com/nebolax/aavealarm/assets/63492346/24bc94fa-66da-4df4-bb65-7e77ba92c277)

## Tech info

The mobile app itself is developed with react native + expo, and the backend part that is responsible for monitoring health factors and liquidations is just a simple python script. Users' tracked addresses and other data are saved in supabase database.

## Contribution

Feel free to contribute! Open an issue or a pull request in a free form and you will be guided through the next steps.

## Aave Simulation

Do you want to simulate changes to your Aave positions before taking real actions? Check out [defisim.xyz](https://defisim.xyz)!
