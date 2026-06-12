import React from 'react'
import Dojah from 'react-dojah'

export default function DojahWidget(props) {

  const appID = "6798b9bd38ec9f5f7473a73c";

  /**
   *  This is your account public key
   *  (go to your dashboard at
   *  https://dojah.io/dashboard to
   *  retrieve it. You can also regenerate one)
   */
  const publicKey = "prod_pk_at40B4RXSA3Lt9jgApq3vT8dL";

  /**
   *  This is the widget type you'd like to load
   *  (go to your dashboard at
   *  https://dojah.io/dashboard to enable different
   *  widget types)
   */
  const type = "custom";

  const config = {
  	widget_id: "681a142e10b23ed0eab43fee" //this is generated from easyonboard here https://app.dojah.io/easy-onboard
  };

  /**
   *  These are the user's data to verify, options
   *  available to you possible options are:
   *  {first_name: STRING, last_name: STRING, dob: DATE STRING}
   *
   *  NOTE: Passing all the values will automatically skip
   *  the user-data page (thus the commented out `last_name`)
   */
  const userData = {
    first_name: "Olanrewaju",
    last_name: "Kabiru",
  };


   const govData = {
    nin: '',
    bvn: '',
    dl: '',
    mobile: '',
 
  };

  /**
   *  These are the metadata options
   *  You can pass any values within the object
   */
  const metadata = {
    user_id: '1234567890',
  };
 

  /**
   * @param {String} type
   * This method receives the type
   * The type can only be one of:
   * loading, begin, success, error, close
   * @param {String} data
   * This is the data from doja
   */
  const response = (type, data) => {
    console.log(type, data);
    if(type === 'success'){
    }else if(type === 'error'){
    }else if(type === 'close'){
    }else if(type === 'begin'){
    }else if(type === 'loading'){
    }
  }

  // The Dojah library accepts 3 props and
  // initiliazes the doja widget and connect process
  return (
    <Dojah
      response={response}
      appID={appID}
      publicKey={publicKey}
      type={type}
      config={config}
      userData={userData}
      govData={govData}
      metadata={metadata}
    />
  );
}
