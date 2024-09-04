import React, { useRef } from "react";
import emailjs from "@emailjs/browser";
import "../styles/contact.css";

/*** CODE STARTS HERE ***/
const EmailContactForm = () => {
  const form = useRef();

  const sendEmail = (e) => {
    e.preventDefault(); // prevents the page from reloading when you hit “Send”

    emailjs
      .sendForm(
        "service_uugz3je",
        "template_sf1gzmj",
        form.current,
        "uzH1lMtBUDEd0Y1Ak"
      )
      .then(
        (result) => {
          alert("Email sent successfully!");
        },
        (error) => {
          alert("Email send failed!");
        }
      );
  };

  return (
    <form ref={form} onSubmit={sendEmail}>
      <h1>We'd Love To Hear From You.</h1>
      <div className="contactPage">
        <label>Name</label>
        <input className="nameBox" type="text" name="from_name" />
        <label>Email</label>
        <input className="emailBox" type="email" name="user_email" />
        <label>Message</label>
        <textarea name="message" />
        <input type="submit" value="Send" />
      </div>
    </form>
  );
};

export default EmailContactForm;
