# SFMC Journey Builder
## Custom Activity - Send To Webhook

### Pre-Requisites

* A Salesforce Marketing Cloud account
* Journey Builder and all associated applications  must be provisioned into this account
* A publicly accessible web server or cloud
* Web Server or Cloud MUST support SSL (you don't have to worry about SSL-setup when using Heroku)
* A valid App Center Developer Account
* Understanding of client-server communications, JavaScript, HTML(5), Node.js and Express

### How To Use

#### Creating a base app in App Center

1. Login to your [App Center account] (https://appcenter-auth.s1.marketingcloudapps.com/)

2. Select "Create New App"

5. Select "Package" as the template type and use the following properties:
    
    * Category: HubExchange
    * Name: &lt;YOUR_APP_NAME&gt;
    * Description: &lt;DESCRIBE_WHAT_APP_IS_DOING&gt;
    * Package: &lt;THIS MUST BE UNIQUE ACROSS ALL OF SFMC&gt

    * Application Endpoints: The base is your publicly accessible web server's endpoint for this app, this can be updated later, MUST BE OVER SSL
        * Login URL: &lt;YOUR_APP_ENDPOINT>/login
        * Logout URL: &lt;YOUR_APP_ENDPOINT>/logout
        * Redirect URL: &lt;YOUR_APP_ENDPOINT>/

6. Integrate your app with an Account (Business Unit)

7. Data Access: No (SSO Only):

    * Data - Data Extensions (Read)
    * Automation - Interactions (Execute, Read)

8. Make sure everything is correct, and finish

9. If everything is successful, you should see a message saying so. Stay on this screen

#### Copying App Center Data

1. Open config.json file in the 'config' folder

2. Copy the values from the App Center into this file

<code>
    <pre>
         {
            "appId"           : "__insert_your_app_id__",
            "clientId"        : "__insert_your_app_client_id__",
            "clientSecret"    : "__insert_your_app_client_secret__",
            "appSignature"    : "__insert_your_app_signature__",
            "authUrl"         : "https://auth.exacttargetapis.com/v1/requestToken?legacy=1"
            "stack"           : "_stack_of_app_ex_S6_S7_",
            "jwtSecret"     : "_unconverted_salt_key_"
        };
    </pre>
</code>

#### Web Server

1. Make sure that your server endpoint for our app is up and running

#### Defining our Activity App Extension
1. In App Center, with your newly created app open, go to the 'Journey Builder Activity' tab

2. Click "Create Journey Builder Activity"

3. Properties:
    * Name: &lt;YOUR_CUSTOM_ACIVITY_NAME&gt;
    * Key: &lt;ANY UNIQUE KEY OR GUID&gt;
    * Description: &lt;YOUR_DESCRIPTION&gt;
    * Endpoint URL: https://&lt;webserver-endpoint&gt;/jb/activities/send-to-webhook (no trailing slash)
    * Help URL: https://&lt;webserver-endpoint&gt;/jb/activities/send-to-webhook/help (no trailing slash)
    * Help Description: &lt;YOUR_DESCRIPTION&gt;
    * Category: Messaging
    * Public Extension: This application and all other installed applications

**NOTE:** These properties may be overwritten by the config.json file in /jb/activities/send-to-webhook

4. Save

#### Updating the code to reflect our new App Extensions
1. Open /jb/activities/send-to-webhook/config.json

2. Copy the "Key" property from your App Extension Custom Activity and paste it into the "applicationExtensionKey" value

3. Replace the "__insert_your_custom_activity_endpoint__" with your web server's endpoint throughout the file. For example, "https://__insert_your_custom_activity_endpoint__/execute/" would become "https://zapier-jb-test.herokuapp.com/jb/activities/send-to-webhook/execute/"

#### Re-deploy application to host
Now that you have updated your configurations to point to the appropriate SFMC resources, push your changes.

#### Testing our app loads in the Marketing Cloud
1. Log into the [Salesforce Marketing Cloud](https://mc.exacttarget.com/cloud)

2. Go to Journey Builder and create a new journey or open existing one that is in Draft status

3. You should see app icon in the acivities canvas

#### Configuring Custom Activity in Journey Builder
1. Drag your custom activity from the list onto the Interaction Canvas

2. Hover and click the "Configure" button

3. The Custom Activity dialog should appear (this is loading from your app)

4. Click save

5. The Activity is now configured.

#### Testing an Interaction with Custom Activity
1. Create a new journey

2. Drag event on the canvas and configure it

3. Drag your custom activity on the canvas and configure it

4. Save and activate the journey

5. Fire the event

6. Check that your custom activity works
