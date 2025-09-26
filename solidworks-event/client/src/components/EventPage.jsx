import { useEffect, useState, useRef } from "react";
import "./EventPage.css";
import CkonnectLogo from "../assets/CkonnectLogo.png";
import DSLogo from "../assets/DSLogo.png";
import DSBanner from "../assets/DS.png";
import VenueImage from "../assets/facadenight.jpg";
import SolidCAMLogo from "../assets/SolidCAM SponserLogo.png";

export default function EventPage() {
    const [countdown, setCountdown] = useState({
        days: "00",
        hours: "00",
        minutes: "00",
        seconds: "00",
    });

    const [showForm, setShowForm] = useState(false);
    const [showPopup, setShowPopup] = useState(false);

    const formRef = useRef(null);

    useEffect(() => {
        const eventDate = new Date("Oct 30, 2025 09:00:00").getTime();

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const diff = eventDate - now;

            if (diff <= 0) {
                clearInterval(timer);
                setCountdown({ days: "00", hours: "00", minutes: "00", seconds: "00" });
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setCountdown({
                days: days < 10 ? "0" + days : days,
                hours: hours < 10 ? "0" + hours : hours,
                minutes: minutes < 10 ? "0" + minutes : minutes,
                seconds: seconds < 10 ? "0" + seconds : seconds,
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const showFinalForm = () => {
        setShowForm(true);
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
    };

    const submitFinalForm = (e) => {
        e.preventDefault();
        const formData = {
            name: e.target.name.value,
            phone: e.target.phone.value,
            email: e.target.email.value,
            organization: e.target.organization.value,
            designation: e.target.designation.value,
        };

        if (Object.values(formData).some((v) => !v)) {
            alert("Please fill all the required fields.");
            return;
        }

        // Show popup & scroll immediately
        setShowPopup(true);
        window.scrollTo({ top: 0, behavior: "smooth" });

        // Hide popup after 3 seconds
        setTimeout(() => setShowPopup(false), 3000);

        // Optionally hide form after submission
        setShowForm(false);

        // Reset the form immediately
        e.target.reset();

        // Send request in the background
        fetch("http://localhost:5000/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        })
            .then((res) => {
                if (!res.ok) throw new Error("Error submitting form");
            })
            .catch((err) => {
                console.error(err);
                alert("Server error, please try again later.");
            });
    };



    return (
        <div>
            {/* Header */}
            <header className="header">
                <img src={CkonnectLogo} alt="Left Logo" />
                <img src={DSLogo} alt="Right Logo" />
            </header>

            {/* Hero Section */}
            <section className="hero">
                <div className="hero-left">
                    <h1>SOLIDWORKS 2026 Launch Event – Bengaluru</h1>
                    <div className="event-info">
                        📅 October 30, 2025 • ⏰ 09:00 AM<br />
                        📍 Bengaluru, Karnataka - India
                    </div>
                    <button className="register-btn" onClick={showFinalForm}>
                        REGISTER NOW
                    </button>

                    <div className="countdown">
                        <div>
                            <span>{countdown.days}</span>
                            <br />Days
                        </div>
                        <div>
                            <span>{countdown.hours}</span>
                            <br />Hours
                        </div>
                        <div>
                            <span>{countdown.minutes}</span>
                            <br />Minutes
                        </div>
                        <div>
                            <span>{countdown.seconds}</span>
                            <br />Seconds
                        </div>
                    </div>

                    <div className="sponsors">
                        <p>Sponsored by</p>
                        <img src={SolidCAMLogo} alt="SolidCAM Logo" />
                    </div>
                </div>

                <div className="hero-right">
                    <img src={DSBanner} alt="Event Banner" />
                    <div className="hero-content-desc">
                        SOLIDWORKS 2026 is coming to India! Be among the first to experience what’s new.
                    </div>
                </div>
            </section>

            {/* Venue Section */}
            <section className="venue">
                <h3>Venue</h3>
                <p>Join us at the following location:</p>
                <div className="venue-details">
                    <div className="venue-card">
                        <img src={VenueImage} alt="Venue" />
                        <h3>Address</h3>
                        <p>
                            Taj Yeshwantpur, Bengaluru<br />
                            2275, Tumkur Rd, Yeshwanthpur Industrial Area,<br />
                            Phase 1, Yeswanthpur,<br />
                            Bengaluru, Karnataka 560022<br />
                            India
                        </p>
                        <a
                            href="https://maps.app.goo.gl/8o6VRvkg4V9WC9BL6"
                            className="direction-btn"
                            target="_blank"
                        >
                            GET DIRECTIONS
                        </a>
                    </div>
                </div>
            </section>

            {/* Registration Form */}
            {showForm && (
                <section className="final-form" ref={formRef}>
                    <h2>Complete Your Registration</h2>
                    <div className="container-flex">
                        <form className="order" onSubmit={submitFinalForm}>
                            <div className="form-section">
                                <label htmlFor="name">Full Name</label>
                                <input type="text" id="name" name="name" required />
                            </div>
                            <div className="form-section">
                                <label htmlFor="phone">Phone Number</label>
                                <input type="tel" id="phone" name="phone" required />
                            </div>
                            <div className="form-section">
                                <label htmlFor="email">Email ID</label>
                                <input type="email" id="email" name="email" required />
                            </div>
                            <div className="form-section">
                                <label htmlFor="organization">Organization</label>
                                <input type="text" id="organization" name="organization" required />
                            </div>
                            <div className="form-section">
                                <label htmlFor="designation">Designation</label>
                                <input type="text" id="designation" name="designation" required />
                            </div>
                            <button className="submit-btn" type="submit">Confirm Registration</button>
                        </form>
                    </div>
                </section>
            )}

            {/* Success Popup */}
            {showPopup && (
                <div className="popup">
                    <div className="popup-content">
                        ✅ Registration submitted successfully!
                    </div>
                </div>
            )}
        </div>
    );
}
