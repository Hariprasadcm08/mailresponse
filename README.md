# maiIn this challenge you will build a small Node.js app. This will require you to integrate a few of Gmail APIs so it would be helpful if you can skim through Google’s API documentation beforehand.                                                                                          You have to write a Node.js based app that is able to respond to emails sent to your Gmail mailbox while you’re out on a vacation. 

**What should the app do?**

1. The app should check for new emails in a given Gmail ID
    
    <aside>
    💡 You need to implement the “Login with google” API for this
    
    </aside>
    
2. The app should send replies to Emails that have no prior replies
    
    <aside>
    💡 The app should identify and isolate the email threads in which no prior email has been sent by you. This means that the app should only reply to first time email threads sent by others to your mailbox.
    The email that you send as a reply can have any content you’d like, it doesn’t matter.
    
    </aside>
    
3. The app should add a Label to the email and move the email to the label
    
    <aside>
    💡 After sending the reply, the email should be tagged with a label in Gmail. Feel free to name the label anything. If the label is not created already, you’ll need to create it. 
    Use Google’s APIs to accomplish this
    
    </aside>
    
4. The app should repeat this sequence of steps 1-3 in random intervals of 45 to 120 second