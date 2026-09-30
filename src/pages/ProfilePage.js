import { apiRequest } from "../services/api.js";
import { getState, setUser } from "../services/state.js";
import { icon } from "../utils/icons.js";
import { showToast } from "../components/Toast.js";
import { navigate } from "../router.js";
export async function renderProfilePage() {
  const { user } = getState();
  if (!user) {
    navigate("/login");
    return "";
  }
  const addrRes = await apiRequest("/auth/addresses");
  const addresses = addrRes.success ? addrRes.addresses : [];
  return `
    <div class="max-w-4xl mx-auto px-4 py-8 space-y-8">
      
      <div class="pb-4 border-b border-slate-200">
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">Account Settings</h1>
        <p class="text-xs text-slate-500">Manage your profile, shipping addresses, and credentials</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <!-- Profile Card -->
        <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div class="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-black text-2xl mx-auto">
            ${user.name.charAt(0).toUpperCase()}
          </div>
          <div class="text-center space-y-0.5">
            <h2 class="text-lg font-black text-slate-900">${user.name}</h2>
            <div class="text-xs text-slate-500">${user.email}</div>
            <div class="pt-2">
              <span class="inline-block px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${user.role === "admin" ? "bg-orange-100 text-orange-800" : "bg-slate-100 text-slate-700"}">
                ${user.role === "admin" ? "Administrator" : "Customer Account"}
              </span>
            </div>
          </div>
          <div class="pt-4 border-t border-slate-100 space-y-2 text-xs">
            <div class="flex justify-between text-slate-600">
              <span>Phone</span>
              <span class="font-bold text-slate-900">${user.phone || "Not set"}</span>
            </div>
            <div class="flex justify-between text-slate-600">
              <span>Addresses Saved</span>
              <span class="font-bold text-slate-900">${addresses.length}</span>
            </div>
          </div>
        </div>

        <!-- Personal Info Form & Address Book -->
        <div class="md:col-span-2 space-y-6">
          
          <!-- Edit Personal Info -->
          <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <h3 class="text-sm font-black text-slate-900 pb-2 border-b border-slate-100">
              Personal Information
            </h3>
            <form id="edit-profile-form" class="space-y-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input type="text" id="prof-name-input" value="${user.name}" class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 outline-hidden" required />
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input type="email" value="${user.email}" disabled class="w-full bg-slate-100 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-500 outline-hidden cursor-not-allowed" />
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input type="tel" id="prof-phone-input" value="${user.phone || ""}" placeholder="+91 98765 43210" class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 outline-hidden" />
                </div>
              </div>
              <button type="submit" class="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer">
                Save Profile Changes
              </button>
            </form>
          </div>

          <!-- Saved Shipping Addresses -->
          <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div class="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 class="text-sm font-black text-slate-900">Delivery Addresses (${addresses.length})</h3>
            </div>

            <div class="space-y-3">
              ${addresses.map((addr) => `
                <div class="p-4 rounded-xl border border-slate-200 flex items-start justify-between gap-4 text-xs">
                  <div class="space-y-1">
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-slate-900">${addr.fullName}</span>
                      <span class="uppercase text-[9px] font-bold px-1.5 py-0.5 rounded ${addr.type === "work" ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-700"}">${addr.type}</span>
                      ${addr.isDefault ? '<span class="bg-orange-100 text-orange-800 font-bold text-[9px] px-1.5 py-0.5 rounded">DEFAULT</span>' : ""}
                    </div>
                    <div class="text-slate-600">${addr.street}, ${addr.city}, ${addr.state} - ${addr.pincode}</div>
                    <div class="text-slate-500 font-medium">Contact: ${addr.phone}</div>
                  </div>

                  <button class="delete-address-btn text-slate-400 hover:text-red-600 p-1 cursor-pointer" data-id="${addr.id}" title="Delete Address">
                    ${icon("trash", "w-4 h-4")}
                  </button>
                </div>
              `).join("")}
            </div>
          </div>

        </div>

      </div>

    </div>
  `;
}
export function attachProfilePageEvents() {
  const reload = () => {
    renderProfilePage().then((html) => {
      const app = document.getElementById("app-content");
      if (app) {
        app.innerHTML = html;
        attachProfilePageEvents();
      }
    });
  };
  const profileForm = document.getElementById("edit-profile-form");
  if (profileForm) {
    profileForm.onsubmit = async (e) => {
      e.preventDefault();
      const name = document.getElementById("prof-name-input").value;
      const phone = document.getElementById("prof-phone-input").value;
      const res = await apiRequest("/auth/profile", {
        method: "PUT",
        body: JSON.stringify({ name, phone })
      });
      if (res.success && res.user) {
        setUser(res.user);
        showToast("Profile updated successfully!", "success");
        reload();
      } else {
        showToast(res.message || "Could not update profile", "error");
      }
    };
  }
  document.querySelectorAll(".delete-address-btn").forEach((btn) => {
    btn.onclick = async () => {
      const addressId = btn.getAttribute("data-id");
      if (!addressId) return;
      if (confirm("Delete this saved address?")) {
        const res = await apiRequest(`/auth/addresses/${addressId}`, { method: "DELETE" });
        if (res.success) {
          showToast("Address deleted", "info");
          reload();
        }
      }
    };
  });
}
