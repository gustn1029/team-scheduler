import { useQuery } from "@tanstack/react-query";
import { appAuth } from "../../firebase/config";
import { userDataFetch } from "../../utils/http";

const Profile = () => {
  const user = useQuery({
    queryKey: ["user"],
    queryFn: () => userDataFetch(appAuth!.currentUser!.uid),
  });

  if(user.isLoading) {
    return <div>Loading...</div>
  }
  if(user.isError) {
    return <div>error...</div>
  }

  console.log(user.data);
  return (
    <div>
      <h3>Profile</h3>
      <p>uid: {user.data?.uid}</p>
      <p>imageUrl: {user.data?.imageUrl}</p>
      <p>nickname: {user.data?.nickname}</p>
      <p>name: {user.data?.name}</p>
      <p>email: {user.data?.email}</p>
    </div>
  );
};

export default Profile;
