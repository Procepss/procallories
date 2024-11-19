const url = "https://api.example.com/data";
const token = "your-bearer-token-here";

axios
  .get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.error("Error:", error);
  });
