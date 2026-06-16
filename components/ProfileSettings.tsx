import React, { useState, useRef, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Save,
  ArrowLeft
} from "lucide-react";

import { toast } from "sonner";


interface ProfileSettingsProps {
  onNavigate: (page: string) => void;
onSaveProfile:(user:any)=>void;
  userName: string;
  userEmail: string;

  userAvatar?: string;
  userPhone?: string;
  userLocation?: string;
  userBio?: string;
}


export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  onNavigate,
  onSaveProfile,
  userName,
  userEmail,
  userAvatar,
  userPhone,
  userLocation,
  userBio
}) => {


const fullName = (userName || "").split(" ");

  const [formData, setFormData] = useState({
    firstName: fullName[0] || "",
    lastName: fullName[1] || "",

    email: userEmail,

    phone: userPhone || "",
    location: userLocation || "",
    bio: userBio || ""
  });


  const [avatarPreview, setAvatarPreview] =
    useState<string | undefined>(userAvatar);

    useEffect(() => {
  setAvatarPreview(userAvatar);
}, [userAvatar]);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [isUploading, setIsUploading] =
    useState(false);

  const [loading, setLoading] =
    useState(false);


  const fileInputRef =
    useRef<HTMLInputElement>(null);



  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };



  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {

    const file = event.target.files?.[0];

    if (!file) return;


    if (file.size > 5 * 1024 * 1024) {
      toast.error("Max image size is 5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload image only");
      return;
    }


    setIsUploading(true);

    setSelectedFile(file);


    const reader = new FileReader();

    reader.onloadend = () => {

      setAvatarPreview(reader.result as string);

      setIsUploading(false);

      toast.success("Image selected successfully");

    };

    reader.onerror = () => {
      toast.error("Image upload failed");
      setIsUploading(false);
    };

    reader.readAsDataURL(file);

  };



  const handleSave = async () => {

    if (!formData.firstName.trim()) {
      toast.error("First name required");
      return;
    }

    if (!formData.lastName.trim()) {
      toast.error("Last name required");
      return;
    }

    try {

      setLoading(true);

      const token = localStorage.getItem("token");


      const data = new FormData();

      data.append(
        "firstName",
        formData.firstName
      );

      data.append(
        "lastName",
        formData.lastName
      );

      data.append(
        "email",
        formData.email
      );

      data.append(
        "phone",
        formData.phone
      );

      data.append(
        "location",
        formData.location
      );

      data.append(
        "bio",
        formData.bio
      );


      if (selectedFile) {
        data.append(
          "profilePicture",
          selectedFile
        );
      }



      const response =
        await fetch(
          "http://localhost:5000/auth/update-profile",
          {
            method: "PUT",

            headers: {
              Authorization: `Bearer ${token}`
            },

            body: data
          }
        );


      const result =
        await response.json();
console.log("FULL RESULT", result);
console.log("PROFILE PIC", result?.data?.profilePicture);
    if(response.ok){

const updatedAvatar =
  result?.data?.profilePicture?.secure_url ||
  result?.data?.profilePicture?.url ||
  result?.data?.profilePicture ||
  result?.data?.avatar ||
  "";

if(updatedAvatar){
setAvatarPreview(updatedAvatar + "?t=" + Date.now());
}

onSaveProfile({
  ...result.data,

  avatar:
    result?.data?.profilePicture?.secure_url ||
    result?.data?.avatar ||
    "",

  name: `${result.data.firstName || ""} ${result.data.lastName || ""}`.trim(),
});
toast.success(
"Profile updated successfully"
);

setTimeout(()=>{
 onNavigate("account");
},1000);

}
      else {

        toast.error(
          result.message ||
          "Update failed"
        );

      }

    }
    catch (error) {

      toast.error(
        "Server error"
      );

    }
    finally {
      setLoading(false);
    }

  };




  return (

    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 pt-32 pb-20 px-6 lg:px-8">

      <div className="max-w-3xl mx-auto">


        <Button
          onClick={() => onNavigate("account")}
          variant="ghost"
          className="mb-6 rounded-[18px]"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Account
        </Button>



        <div className="text-center mb-12">

          <h1 className="text-5xl mb-4 bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
            Profile Settings
          </h1>

          <p className="text-lg text-gray-600">
            Update your personal information
          </p>

        </div>



        <Card className="p-8 rounded-[18px] shadow-xl mb-6">

          <div className="flex flex-col items-center">

            <div className="relative mb-4">

              <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center text-white">

                {
                  avatarPreview
                    ?

                  <img
 key={avatarPreview}
 src={avatarPreview}
 alt="avatar"
 className="w-full h-full object-cover"
/>

                    :

                    <span className="text-5xl">
                      {formData.firstName.charAt(0).toUpperCase()}
                    </span>

                }

              </div>


              <button
                type="button"
                onClick={handleAvatarClick}
                disabled={isUploading}
                className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center"
              >

                <Camera className="w-5 h-5 text-white" />

              </button>


              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

            </div>

            <p className="text-sm text-gray-500">
              {
                isUploading
                  ? "Uploading..."
                  : "Click camera icon to change photo"
              }
            </p>

          </div>

        </Card>




        <Card className="p-8 rounded-[18px] shadow-xl mb-6">

          <div className="space-y-6">


            <div>
              <Label>
                First Name
              </Label>

              <Input
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    firstName: e.target.value
                  })
                }
              />
            </div>



            <div>
              <Label>
                Last Name
              </Label>

              <Input
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    lastName: e.target.value
                  })
                }
              />
            </div>



            <div>
              <Label>
                Email
              </Label>

              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    email: e.target.value
                  })
                }
              />
            </div>



            <div>
              <Label>
                Phone
              </Label>

              <Input
                value={formData.phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    phone: e.target.value
                  })
                }
              />
            </div>



            <div>
              <Label>
                Location
              </Label>

              <Input
                value={formData.location}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: e.target.value
                  })
                }
              />
            </div>



            <div>

              <Label>
                Bio
              </Label>

              <textarea
                rows={4}
                value={formData.bio}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bio: e.target.value
                  })
                }
                className="w-full rounded-[18px] border p-4"
              />

            </div>

          </div>

        </Card>



        <div className="flex justify-center">

          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-gradient-to-r from-cyan-500 to-purple-600 px-8 py-6 rounded-[18px]"
          >

            <Save className="w-5 h-5 mr-2" />

            {
              loading
                ? "Saving..."
                : "Save Changes"
            }

          </Button>

        </div>

      </div>

    </div>

  );

};