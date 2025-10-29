import React, { useState, useEffect } from "react";
import Title from "../../components/Title";
import { assets } from "../../assets/assets";
import axios from "axios";
import { categoriesAPI, branchesAPI } from "../../services/api";

const AddCar = () => {
  const [image, setImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [branches, setBranches] = useState([]);
  const [car, setCar] = useState({
    brand: "",
    model: "",
    year: "",
    category_id: "",
    branch_id: "",
    color: "",
    transmission: "",
    fuel_type: "",
    seating_capacity: "",
    location: "",
    description: "",
    mileage: "",
  });
  const [loading, setLoading] = useState({ categories: false, branches: false });
  const [error, setError] = useState("");

  // Fetch categories and branches
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading({ categories: true, branches: true });
        const [catRes, branchRes] = await Promise.all([
          categoriesAPI.getAll(),
          branchesAPI.getAll(),
        ]);
        console.log('Categories API response:', catRes.data);
        console.log('Branches API response:', branchRes.data);
        setCategories(catRes.data?.data || []);
        setBranches(branchRes.data?.data || []);
      } catch (err) {
        console.error("Error fetching categories or branches:", err);
        setError("Failed to load categories or branches. Please try again.");
      } finally {
        setLoading({ categories: false, branches: false });
      }
    };
    fetchData();
  }, []);

  // Submit form handler
  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("category_id", car.category_id);
      formData.append("branch_id", car.branch_id);
      formData.append("brand", car.brand);
      formData.append("model", car.model);
      formData.append("year", car.year);
      formData.append("color", car.color);
      formData.append("license_plate", `${car.brand}-${Date.now()}`); // temporary unique license
      formData.append("mileage", car.mileage || 0);
      formData.append("status", "available");
      formData.append("description", car.description);
      if (image) formData.append("image", image);

      const res = await axios.post(
        "http://localhost:5000/api/controller/car",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`, // if protected
          },
        }
      );

      if (res.status === 200 || res.status === 201) {
        alert("✅ Car created successfully!");
        setCar({
          brand: "",
          model: "",
          year: "",
          category_id: "",
          branch_id: "",
          color: "",
          transmission: "",
          fuel_type: "",
          seating_capacity: "",
          location: "",
          description: "",
          mileage: "",
        });
        setImage(null);
      } else {
        alert("Something went wrong.");
      }
    } catch (error) {
      console.error("❌ Error submitting car:", error.response?.data || error.message);
      alert("Failed to add car. Check console for details.");
    }
  };

  return (
    <div className="flex justify-center items-start px-4 py-10 md:px-10 min-h-screen bg-gray-50">
      <div className="w-full max-w-2xl">
        <Title
          title="Add New Car"
          subtitle="Fill in the car details below. Make sure category and branch exist first."
        />

        <form
          onSubmit={onSubmitHandler}
          className="flex flex-col gap-5 text-gray-600 text-sm mt-6 bg-white p-8 rounded-lg shadow-md"
        >
          {/* Car Image */}
          <div className="flex items-center gap-3">
            <label htmlFor="car-image">
              <img
                src={image ? URL.createObjectURL(image) : assets.upload_icon}
                alt=""
                className="h-16 w-16 rounded cursor-pointer border"
              />
            </label>
            <input
              type="file"
              id="car-image"
              accept="image/*"
              hidden
              onChange={(e) => setImage(e.target.files[0])}
            />
            <p className="text-sm text-gray-500">Upload a picture of your car</p>
          </div>

          {/* Brand & Model */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              type="text"
              placeholder="Brand"
              required
              className="px-3 py-2 border border-gray-300 rounded-md"
              value={car.brand}
              onChange={(e) => setCar({ ...car, brand: e.target.value })}
            />
            <input
              type="text"
              placeholder="Model"
              required
              className="px-3 py-2 border border-gray-300 rounded-md"
              value={car.model}
              onChange={(e) => setCar({ ...car, model: e.target.value })}
            />
          </div>

          {/* Year, Color, Mileage */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <input
              type="number"
              placeholder="Year"
              required
              className="px-3 py-2 border border-gray-300 rounded-md"
              value={car.year}
              onChange={(e) => setCar({ ...car, year: e.target.value })}
            />
            <input
              type="text"
              placeholder="Color"
              className="px-3 py-2 border border-gray-300 rounded-md"
              value={car.color}
              onChange={(e) => setCar({ ...car, color: e.target.value })}
            />
            <input
              type="number"
              placeholder="Mileage (km)"
              className="px-3 py-2 border border-gray-300 rounded-md"
              value={car.mileage}
              onChange={(e) => setCar({ ...car, mileage: e.target.value })}
            />
          </div>

          {/* Category and Branch */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <select
              value={car.category_id}
              onChange={(e) => setCar({ ...car, category_id: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Select Category</option>
              {categories.length === 0 ? (
                <option value="" disabled>
                  No categories found
                </option>
              ) : (
                categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))
              )}
            </select>
            {loading.categories && (
              <span className="text-xs text-gray-500">Loading categories…</span>
            )}
            {!loading.categories && categories.length > 0 && (
              <span className="text-xs text-gray-400">{categories.length} categories loaded</span>
            )}

            <select
              value={car.branch_id}
              onChange={(e) => setCar({ ...car, branch_id: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Select Branch</option>
              {branches.length === 0 ? (
                <option value="" disabled>
                  No branches found
                </option>
              ) : (
                branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))
              )}
            </select>
            {loading.branches && (
              <span className="text-xs text-gray-500">Loading branches…</span>
            )}
            {!loading.branches && branches.length > 0 && (
              <span className="text-xs text-gray-400">{branches.length} branches loaded</span>
            )}
          </div>
          {error && (
            <div className="text-sm text-red-600">{error}</div>
          )}

          {/* Description */}
          <textarea
            rows={4}
            placeholder="Description..."
            className="px-3 py-2 border border-gray-300 rounded-md"
            value={car.description}
            onChange={(e) => setCar({ ...car, description: e.target.value })}
          />

          <button
            type="submit"
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-md"
          >
            Add Car
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCar;
