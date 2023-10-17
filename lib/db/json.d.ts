declare namespace PrismaJson {
  interface UserPreferences {
    // Note: the default value of the database column is {}, so every field
    // must be optional.

    timeFormat?: "12hr" | "24hr";
  }
}
