const PULP_SITES_DEF = "/home/pulpmx/www/sites/default/";
const PULP_PODS = PULP_SITES_DEF + "files/podcasts/";
const PULPSHOW_PODS = "/home/pulpshow/www/sites/pulpmxshow.com/files/podcasts/";
const HOCKEY_PODS = "/home/pulpuck/www/shows/";
const ADMIN = "/home/pulpmx/www/admin/";

const fileLocations = {
  pulpmx: PULPSHOW_PODS,
  steveshow: PULP_PODS,
  keefer: PULP_PODS,
  moto60: PULP_PODS + "preshows/",
  hockey: HOCKEY_PODS,
  admin: ADMIN,
  shiftinggears: PULP_PODS,
  industryseating: PULP_PODS
};

module.exports = fileLocations;
