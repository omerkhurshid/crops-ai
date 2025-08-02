import { gql } from 'graphql-tag'

export const typeDefs = gql`
  # Scalars
  scalar DateTime
  scalar JSON
  scalar Upload

  # Enums
  enum UserRole {
    FARM_OWNER
    FARM_MANAGER
    AGRONOMIST
    ADMIN
  }

  enum CropStatus {
    PLANNED
    PLANTED
    GROWING
    READY_TO_HARVEST
    HARVESTED
    FAILED
  }

  enum StressLevel {
    NONE
    LOW
    MODERATE
    HIGH
    SEVERE
  }

  # Types
  type User {
    id: ID!
    email: String!
    name: String!
    role: UserRole!
    createdAt: DateTime!
    updatedAt: DateTime!
    ownedFarms: [Farm!]!
    managedFarms: [Farm!]!
  }

  type Farm {
    id: ID!
    name: String!
    latitude: Float!
    longitude: Float!
    address: String
    region: String
    country: String!
    totalArea: Float!
    createdAt: DateTime!
    updatedAt: DateTime!
    owner: User!
    managers: [User!]!
    fields: [Field!]!
  }

  type Field {
    id: ID!
    name: String!
    area: Float!
    boundary: JSON
    soilType: String
    createdAt: DateTime!
    updatedAt: DateTime!
    farm: Farm!
    crops: [Crop!]!
    currentCrop: Crop
    weatherData: [WeatherData!]!
    satelliteData: [SatelliteData!]!
  }

  type Crop {
    id: ID!
    cropType: String!
    variety: String
    plantingDate: DateTime!
    expectedHarvestDate: DateTime!
    actualHarvestDate: DateTime
    status: CropStatus!
    yield: Float
    createdAt: DateTime!
    updatedAt: DateTime!
    field: Field!
  }

  type WeatherData {
    id: ID!
    timestamp: DateTime!
    temperature: Float!
    humidity: Float!
    precipitation: Float!
    windSpeed: Float!
    windDirection: Float!
    pressure: Float!
    cloudCover: Float!
    field: Field!
  }

  type WeatherForecast {
    date: DateTime!
    minTemp: Float!
    maxTemp: Float!
    precipitationProbability: Float!
    precipitationAmount: Float
    conditions: String!
  }

  type SatelliteData {
    id: ID!
    captureDate: DateTime!
    ndvi: Float!
    ndviChange: Float
    stressLevel: StressLevel
    imageUrl: String
    field: Field!
  }

  # Input Types
  input CreateUserInput {
    email: String!
    name: String!
    role: UserRole = FARM_OWNER
  }

  input UpdateUserInput {
    name: String
    role: UserRole
  }

  input CreateFarmInput {
    name: String!
    latitude: Float!
    longitude: Float!
    address: String
    region: String
    country: String!
    totalArea: Float!
  }

  input UpdateFarmInput {
    name: String
    latitude: Float
    longitude: Float
    address: String
    region: String
    country: String
    totalArea: Float
  }

  input CreateFieldInput {
    farmId: ID!
    name: String!
    area: Float!
    boundary: JSON
    soilType: String
  }

  input UpdateFieldInput {
    name: String
    area: Float
    boundary: JSON
    soilType: String
  }

  input CreateCropInput {
    fieldId: ID!
    cropType: String!
    variety: String
    plantingDate: DateTime!
    expectedHarvestDate: DateTime!
    status: CropStatus = PLANNED
  }

  input UpdateCropInput {
    cropType: String
    variety: String
    plantingDate: DateTime
    expectedHarvestDate: DateTime
    actualHarvestDate: DateTime
    status: CropStatus
    yield: Float
  }

  input PaginationInput {
    page: Int = 1
    limit: Int = 10
    sortBy: String
    sortOrder: String = "desc"
  }

  input FarmFiltersInput {
    ownerId: ID
    managerId: ID
    country: String
    region: String
  }

  input FieldFiltersInput {
    farmId: ID
    soilType: String
    minArea: Float
    maxArea: Float
  }

  input CropFiltersInput {
    fieldId: ID
    status: CropStatus
    cropType: String
    plantingDateFrom: DateTime
    plantingDateTo: DateTime
  }

  # Pagination Types
  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
    totalCount: Int!
    totalPages: Int!
    currentPage: Int!
  }

  type FarmConnection {
    edges: [FarmEdge!]!
    pageInfo: PageInfo!
  }

  type FarmEdge {
    node: Farm!
    cursor: String!
  }

  type FieldConnection {
    edges: [FieldEdge!]!
    pageInfo: PageInfo!
  }

  type FieldEdge {
    node: Field!
    cursor: String!
  }

  type CropConnection {
    edges: [CropEdge!]!
    pageInfo: PageInfo!
  }

  type CropEdge {
    node: Crop!
    cursor: String!
  }

  # Queries
  type Query {
    # User queries
    me: User
    user(id: ID!): User
    users(pagination: PaginationInput): [User!]!

    # Farm queries
    farm(id: ID!): Farm
    farms(pagination: PaginationInput, filters: FarmFiltersInput): FarmConnection!
    myFarms(pagination: PaginationInput): FarmConnection!

    # Field queries
    field(id: ID!): Field
    fields(pagination: PaginationInput, filters: FieldFiltersInput): FieldConnection!

    # Crop queries
    crop(id: ID!): Crop
    crops(pagination: PaginationInput, filters: CropFiltersInput): CropConnection!

    # Weather queries
    weatherForecast(fieldId: ID!, days: Int = 7): [WeatherForecast!]!
    weatherHistory(fieldId: ID!, from: DateTime!, to: DateTime!): [WeatherData!]!

    # Satellite queries
    satelliteHistory(fieldId: ID!, from: DateTime!, to: DateTime!): [SatelliteData!]!
    latestSatelliteData(fieldId: ID!): SatelliteData

    # Analytics queries
    farmAnalytics(farmId: ID!, from: DateTime!, to: DateTime!): JSON!
    fieldAnalytics(fieldId: ID!, from: DateTime!, to: DateTime!): JSON!
    cropAnalytics(cropId: ID!): JSON!
  }

  # Mutations
  type Mutation {
    # User mutations
    createUser(input: CreateUserInput!): User!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    deleteUser(id: ID!): Boolean!

    # Farm mutations
    createFarm(input: CreateFarmInput!): Farm!
    updateFarm(id: ID!, input: UpdateFarmInput!): Farm!
    deleteFarm(id: ID!): Boolean!
    addFarmManager(farmId: ID!, userId: ID!): Farm!
    removeFarmManager(farmId: ID!, userId: ID!): Farm!

    # Field mutations
    createField(input: CreateFieldInput!): Field!
    updateField(id: ID!, input: UpdateFieldInput!): Field!
    deleteField(id: ID!): Boolean!

    # Crop mutations
    createCrop(input: CreateCropInput!): Crop!
    updateCrop(id: ID!, input: UpdateCropInput!): Crop!
    deleteCrop(id: ID!): Boolean!
    harvestCrop(id: ID!, yield: Float!): Crop!

    # Data ingestion mutations
    ingestWeatherData(fieldId: ID!): [WeatherData!]!
    ingestSatelliteData(fieldId: ID!): SatelliteData!
    
    # File upload mutations
    uploadFieldImage(fieldId: ID!, file: Upload!): String!
    uploadCropImage(cropId: ID!, file: Upload!): String!
  }

  # Subscriptions for real-time updates
  type Subscription {
    weatherDataUpdated(fieldId: ID!): WeatherData!
    satelliteDataUpdated(fieldId: ID!): SatelliteData!
    cropStatusChanged(fieldId: ID!): Crop!
    farmUpdated(farmId: ID!): Farm!
  }
`