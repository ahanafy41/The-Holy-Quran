import React from 'react';
import { adhkar } from '../data/adhkar'; // استيراد الأذكار من الملف الجديد
import { AdhkarCategory } from '../types'; // استيراد الـ Type الجديد
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle } from '@ionic/react';
import './HisnAlMuslimPage.css'; // تأكد إن الملف ده موجود للتنسيق أو اعمل واحد جديد لو محتاج

const HisnAlMuslimPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>حصن المسلم</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <div className="hisn-al-muslim-container">
          {adhkar.map((category: AdhkarCategory) => (
            <div key={category.id} className="adhkar-category-card ion-margin-bottom">
              <h2 className="adhkar-category-title ion-padding-horizontal ion-padding-top">
                {category.category}
              </h2>
              <div className="adhkar-items-list ion-padding-horizontal ion-padding-bottom">
                {category.sections.map(item => (
                  <div key={item.id} className="adhkar-item-card ion-margin-vertical">
                    <p className="adhkar-text">{item.text}</p>
                    {item.count && <span className="adhkar-count"> ({item.count} مرة)</span>}
                    {item.explanation && <p className="adhkar-explanation">الشرح: {item.explanation}</p>}
                    {item.reference && <p className="adhkar-reference">المرجع: {item.reference}</p>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default HisnAlMuslimPage;
