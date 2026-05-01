import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { bookingApi } from "../lib/api";
import "../styles/booking.css";

const GARMENT_OPTIONS = ["shirt", "pant", "kurta", "suit", "blouse", "alteration"];
const FABRIC_OPTIONS = ["cotton", "linen", "silk", "denim", "wool", "polyester"];
const MEASUREMENT_FIELDS = [
  ["chest", "Chest"],
  ["waist", "Waist"],
  ["shoulder", "Shoulder"],
  ["sleeveLength", "Sleeve length"],
  ["hips", "Hips"],
  ["length", "Length"],
];

const initialAddress = {
  line1: "",
  line2: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
};

const initialMeasurements = {
  unit: "inch",
  chest: "",
  waist: "",
  shoulder: "",
  sleeveLength: "",
  hips: "",
  length: "",
};

export default function Booking() {
  const navigate = useNavigate();
  const [garmentType, setGarmentType] = useState("shirt");
  const [customGarment, setCustomGarment] = useState("");
  const [fabricType, setFabricType] = useState("cotton");
  const [fabricColor, setFabricColor] = useState("");
  const [fabricProvidedBy, setFabricProvidedBy] = useState("customer");
  const [measurementPreference, setMeasurementPreference] = useState("tailor_visit");
  const [measurements, setMeasurements] = useState(initialMeasurements);
  const [measurementImage, setMeasurementImage] = useState(null);
  const [referenceImages, setReferenceImages] = useState([]);
  const [deliveryMethod, setDeliveryMethod] = useState("tailor_pickup");
  const [address, setAddress] = useState(initialAddress);
  const [coordinates, setCoordinates] = useState({ lat: "", lng: "" });
  const [customerNote, setCustomerNote] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);

  const selectedGarment = customGarment.trim() || garmentType;
  const hasManualMeasurement = useMemo(() => (
    MEASUREMENT_FIELDS.some(([key]) => String(measurements[key] || "").trim())
  ), [measurements]);

  const updateAddress = (field, value) => {
    setAddress((current) => ({ ...current, [field]: value }));
  };

  const updateMeasurement = (field, value) => {
    setMeasurements((current) => ({ ...current, [field]: value }));
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setStatus({ type: "error", message: "Your browser does not support location access." });
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          lat: String(position.coords.latitude.toFixed(6)),
          lng: String(position.coords.longitude.toFixed(6)),
        });
        setLocating(false);
      },
      () => {
        setStatus({ type: "error", message: "Could not read your location. Please enter coordinates manually." });
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const validateForm = () => {
    if (!selectedGarment.trim()) return "Please enter what you want stitched.";
    if (!address.line1.trim()) return "Address line 1 is required.";
    if (!coordinates.lat || !coordinates.lng) return "Latitude and longitude are required.";

    if (measurementPreference === "measurement_image" && !measurementImage) {
      return "Please upload a measurement image.";
    }

    if (measurementPreference === "manual_values" && !hasManualMeasurement) {
      return "Please add at least one measurement value.";
    }

    return "";
  };

  const buildMeasurementsPayload = () => {
    const payload = { unit: measurements.unit };

    MEASUREMENT_FIELDS.forEach(([key]) => {
      const value = String(measurements[key] || "").trim();
      if (value) payload[key] = Number(value);
    });

    return payload;
  };

  const buildFormData = () => {
    const formData = new FormData();
    formData.append("garmentType", selectedGarment.trim());
    formData.append("fabricType", fabricType.trim());
    formData.append("fabricColor", fabricColor.trim());
    formData.append("fabricProvidedBy", fabricProvidedBy);
    formData.append("measurementPreference", measurementPreference);
    formData.append("deliveryMethod", deliveryMethod);
    formData.append("coordinates", JSON.stringify({
      lat: Number(coordinates.lat),
      lng: Number(coordinates.lng),
    }));
    formData.append("deliveryAddress", JSON.stringify(address));

    if (customerNote.trim()) {
      formData.append("customerNote", customerNote.trim());
    }

    if (measurementPreference === "manual_values") {
      formData.append("measurements", JSON.stringify(buildMeasurementsPayload()));
    }

    if (measurementPreference === "measurement_image" && measurementImage) {
      formData.append("measurementImage", measurementImage);
    }

    referenceImages.forEach((file) => {
      formData.append("referenceImages", file);
    });

    return formData;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateForm();

    if (validationError) {
      setStatus({ type: "error", message: validationError });
      return;
    }

    setSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      const response = await bookingApi.createOrder(buildFormData());
      const order = response?.data;
      navigate(`/orders/${order?._id}`, {
        replace: true,
        state: {
          flash: response?.message || "Order created successfully.",
        },
      });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="order-page">
      <section className="order-hero">
        <div>
          <p className="order-kicker">New order</p>
          <h1>Create a stitching order</h1>
          <p>Share garment, fabric, address, coordinates, and measurement preference. Nearby tailors will receive the request automatically.</p>
        </div>
        <Link to="/orders" className="order-link-button">View my orders</Link>
      </section>

      <form className="order-layout" onSubmit={handleSubmit}>
        <div className="order-main">
          <section className="order-panel">
            <div className="order-panel-head">
              <h2>Garment details</h2>
              <p>Choose the service tailors should match against.</p>
            </div>

            <div className="order-choice-grid">
              {GARMENT_OPTIONS.map((item) => (
                <button
                  className={`order-choice ${garmentType === item && !customGarment ? "active" : ""}`}
                  key={item}
                  type="button"
                  onClick={() => {
                    setGarmentType(item);
                    setCustomGarment("");
                  }}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="order-field">
              <label htmlFor="customGarment">Other garment</label>
              <input
                id="customGarment"
                value={customGarment}
                onChange={(event) => setCustomGarment(event.target.value)}
                placeholder="Example: lehenga, skirt, school uniform"
              />
            </div>

            <div className="order-two">
              <div className="order-field">
                <label htmlFor="fabricType">Fabric</label>
                <select id="fabricType" value={fabricType} onChange={(event) => setFabricType(event.target.value)}>
                  {FABRIC_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
              <div className="order-field">
                <label htmlFor="fabricColor">Fabric color</label>
                <input
                  id="fabricColor"
                  value={fabricColor}
                  onChange={(event) => setFabricColor(event.target.value)}
                  placeholder="White, navy, maroon"
                />
              </div>
            </div>

            <div className="order-field">
              <label>Fabric provided by</label>
              <div className="order-segment">
                {[
                  ["customer", "Customer"],
                  ["tailor", "Tailor"],
                  ["undecided", "Decide later"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    className={fabricProvidedBy === value ? "active" : ""}
                    type="button"
                    onClick={() => setFabricProvidedBy(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="order-panel">
            <div className="order-panel-head">
              <h2>Measurements</h2>
              <p>Pick one method only.</p>
            </div>

            <div className="order-method-grid">
              {[
                ["tailor_visit", "Tailor will take measurements", "No measurement file or values needed."],
                ["measurement_image", "Upload measurement image", "Send one clear photo with body measurements."],
                ["manual_values", "Enter measurements", "Add values in inch or cm."],
              ].map(([value, title, description]) => (
                <button
                  className={`order-method ${measurementPreference === value ? "active" : ""}`}
                  key={value}
                  type="button"
                  onClick={() => {
                    setMeasurementPreference(value);
                    if (value !== "measurement_image") setMeasurementImage(null);
                    if (value !== "manual_values") setMeasurements(initialMeasurements);
                  }}
                >
                  <strong>{title}</strong>
                  <span>{description}</span>
                </button>
              ))}
            </div>

            {measurementPreference === "measurement_image" && (
              <div className="order-field">
                <label htmlFor="measurementImage">Measurement image</label>
                <input
                  id="measurementImage"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => setMeasurementImage(event.target.files?.[0] || null)}
                />
              </div>
            )}

            {measurementPreference === "manual_values" && (
              <>
                <div className="order-field order-unit-field">
                  <label htmlFor="unit">Unit</label>
                  <select id="unit" value={measurements.unit} onChange={(event) => updateMeasurement("unit", event.target.value)}>
                    <option value="inch">inch</option>
                    <option value="cm">cm</option>
                  </select>
                </div>
                <div className="order-measure-grid">
                  {MEASUREMENT_FIELDS.map(([key, label]) => (
                    <div className="order-field" key={key}>
                      <label htmlFor={key}>{label}</label>
                      <input
                        id={key}
                        type="number"
                        min="0"
                        step="0.1"
                        value={measurements[key]}
                        onChange={(event) => updateMeasurement(key, event.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>

          <section className="order-panel">
            <div className="order-panel-head">
              <h2>Address and reference</h2>
              <p>Coordinates are used to find tailors within 15 km.</p>
            </div>

            <div className="order-field">
              <label>Delivery method</label>
              <div className="order-segment">
                {[
                  ["tailor_pickup", "Tailor pickup"],
                  ["self_deliver", "Self deliver"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    className={deliveryMethod === value ? "active" : ""}
                    type="button"
                    onClick={() => setDeliveryMethod(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="order-field">
              <label htmlFor="line1">Address line 1</label>
              <input id="line1" value={address.line1} onChange={(event) => updateAddress("line1", event.target.value)} />
            </div>

            <div className="order-field">
              <label htmlFor="line2">Address line 2</label>
              <input id="line2" value={address.line2} onChange={(event) => updateAddress("line2", event.target.value)} />
            </div>

            <div className="order-three">
              <div className="order-field">
                <label htmlFor="city">City</label>
                <input id="city" value={address.city} onChange={(event) => updateAddress("city", event.target.value)} />
              </div>
              <div className="order-field">
                <label htmlFor="state">State</label>
                <input id="state" value={address.state} onChange={(event) => updateAddress("state", event.target.value)} />
              </div>
              <div className="order-field">
                <label htmlFor="pincode">Pincode</label>
                <input id="pincode" value={address.pincode} onChange={(event) => updateAddress("pincode", event.target.value)} />
              </div>
            </div>

            <div className="order-two align-end">
              <div className="order-field">
                <label htmlFor="lat">Latitude</label>
                <input id="lat" type="number" step="any" value={coordinates.lat} onChange={(event) => setCoordinates((current) => ({ ...current, lat: event.target.value }))} />
              </div>
              <div className="order-field">
                <label htmlFor="lng">Longitude</label>
                <input id="lng" type="number" step="any" value={coordinates.lng} onChange={(event) => setCoordinates((current) => ({ ...current, lng: event.target.value }))} />
              </div>
              <button className="order-secondary-action" type="button" onClick={handleUseLocation} disabled={locating}>
                {locating ? "Reading location" : "Use my location"}
              </button>
            </div>

            <div className="order-field">
              <label htmlFor="referenceImages">Reference images</label>
              <input
                id="referenceImages"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={(event) => setReferenceImages(Array.from(event.target.files || []).slice(0, 5))}
              />
            </div>

            <div className="order-field">
              <label htmlFor="customerNote">Suggestion for tailor</label>
              <textarea
                id="customerNote"
                value={customerNote}
                onChange={(event) => setCustomerNote(event.target.value)}
                placeholder="Fit preference, deadline, design idea, pickup instruction"
              />
            </div>
          </section>
        </div>

        <aside className="order-summary-panel">
          <h2>Order summary</h2>
          <div className="order-summary-list">
            <div>
              <span>Garment</span>
              <strong>{selectedGarment}</strong>
            </div>
            <div>
              <span>Fabric</span>
              <strong>{fabricType || "Not set"}</strong>
            </div>
            <div>
              <span>Measurement</span>
              <strong>{measurementPreference.replace("_", " ")}</strong>
            </div>
            <div>
              <span>Delivery</span>
              <strong>{deliveryMethod.replace("_", " ")}</strong>
            </div>
          </div>

          {status.message && <div className={`order-message ${status.type}`}>{status.message}</div>}

          <button className="order-primary-action" type="submit" disabled={submitting}>
            {submitting ? "Creating order" : "Create order"}
          </button>
          <p className="order-muted">Tailors who accept will appear in your order detail page.</p>
        </aside>
      </form>
    </main>
  );
}
