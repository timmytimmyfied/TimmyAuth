# TimmyAuth 

Begin by downloading the necessary files from the repository.

Extract the downloaded files and open the config.json file in a text editor of your choice (e.g., Notepad, Visual Studio Code, etc.).

Create a webhook on Discord by following these steps: Create a server, navigate to settings > Integrations, click on Create Webhook, and copy the generated webhook URL.

Replace the existing webhook inside the config.json file with the one you just created.

Upload the modified files to a GitHub repository.

Head to dashboard.render.com, create a web service, and link it to your GitHub repository.

Name the web service according to your preference for the OAuth link. For instance, if you chose "hypizel-epic-verify" as the name, your OAuth link will be https://hypizel-epic-verify.onrender.com.

Keep most settings as default, but make the following adjustments:
Build Command: npm i
Start Command: node server

Once the deployment is complete and your web service is live, you can copy the provided onRender link. Append "/verify" to the end of the link, resulting in a final URL like this:
https://hypizel-epic-verify.onrender.com/verify

Your setup is now complete, and users can access the verification page using the provided URL.
