import React from 'react';
import { hisnAlMuslimAdhkar } from '../data/hisnAlMuslimContent'; // Import the Hisn Al Muslim adhkar data
import { IonPage, IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonCard, IonCardContent } from '@ionic/react';

const HisnAlMuslimPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>حصن المسلم</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <h2 className="text-xl font-bold mb-4 text-center dark:text-gray-200">أذكار حصن المسلم</h2>
        <IonList>
          {hisnAlMuslimAdhkar.length > 0 ? (
            hisnAlMuslimAdhkar.map((dhikr, index) => (
              <IonCard key={index} className="mb-4 dark:bg-gray-800">
                <IonCardContent>
                  <p className="text-right text-lg leading-relaxed dark:text-gray-200">
                    {dhikr}
                  </p>
                </IonCardContent>
              </IonCard>
            ))
          ) : (
            <IonItem>
              <IonLabel className="text-center text-gray-600 dark:text-gray-400">
                جاري تحميل أذكار حصن المسلم أو لا يوجد أذكار لعرضها.
              </IonLabel>
            </IonItem>
          )}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default HisnAlMuslimPage;
