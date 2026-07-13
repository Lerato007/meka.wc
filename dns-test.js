import dns from "dns";

dns.setServers(["8.8.8.8"]);

dns.resolveSrv("_mongodb._tcp.cluster0.l5tcr.mongodb.net", (err, addresses) => {
  if (err) {
    console.error(err);
    return;
  }

  console.log(addresses);
});