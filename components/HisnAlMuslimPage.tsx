import React, { useState } from 'react';
import { hisnAlMuslimContent } from '../data/hisnAlMuslimContent';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/react';

interface HisnAlMuslimItem {
  category: string;
  content: { text: string; count: string | number; }[];
}

export const HisnAlMuslimPage: React.FC = () => {
  const [data] = useState<HisnAlMuslimItem[]>(hisnAlMuslimContent);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Hisn Al-Muslim</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {data.map((category, index) => (
          <IonCard key={index}>
            <IonCardHeader>
              <IonCardTitle>{category.category}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              {category.content.map((item, itemIndex) => (
                <div key={itemIndex} className="mb-4">
                  <p className="mb-2">{item.text}</p>
                  {item.count && <p className="text-sm text-gray-500">Count: {item.count}</p>}
                </div>
              ))}
            </IonCardContent>
          </IonCard>
        ))}
      </IonContent>
    </IonPage>
  );
};