# Farm Financial Management Implementation Plan

## Overview
Systematic plan to implement comprehensive P&L management system integrated with existing Crops.AI infrastructure.

## Phase 1: Database Schema & Models (Week 1)

### 1.1 Database Schema Extensions

```sql
-- Financial transactions table
CREATE TABLE financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  farm_id UUID REFERENCES farms(id) NOT NULL,
  field_id UUID REFERENCES fields(id),
  crop_id UUID REFERENCES crops(id),
  
  -- Transaction details
  type VARCHAR(50) NOT NULL CHECK (type IN ('income', 'expense')),
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),
  
  -- Financial data
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  quantity DECIMAL(10, 2),
  unit_price DECIMAL(10, 2),
  
  -- Dates
  transaction_date DATE NOT NULL,
  payment_date DATE,
  
  -- Linking
  operation_id UUID REFERENCES farm_operations(id),
  market_price_id UUID REFERENCES market_prices(id),
  
  -- Metadata
  notes TEXT,
  attachments JSONB,
  tags TEXT[],
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  
  -- Indexes
  INDEX idx_financial_farm_date (farm_id, transaction_date),
  INDEX idx_financial_type_category (type, category),
  INDEX idx_financial_field (field_id)
);

-- Financial budgets table
CREATE TABLE financial_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES farms(id) NOT NULL,
  season_id UUID REFERENCES seasons(id) NOT NULL,
  
  -- Budget details
  budget_type VARCHAR(50) NOT NULL,
  category VARCHAR(100) NOT NULL,
  planned_amount DECIMAL(12, 2) NOT NULL,
  actual_amount DECIMAL(12, 2) DEFAULT 0,
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Financial forecasts table
CREATE TABLE financial_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES farms(id) NOT NULL,
  field_id UUID REFERENCES fields(id),
  crop_id UUID REFERENCES crops(id),
  
  -- Forecast data
  forecast_date DATE NOT NULL,
  forecast_type VARCHAR(50) NOT NULL,
  predicted_yield DECIMAL(10, 2),
  predicted_price DECIMAL(10, 2),
  predicted_revenue DECIMAL(12, 2),
  confidence_score DECIMAL(5, 2),
  
  -- ML model reference
  model_id VARCHAR(100),
  model_version VARCHAR(50),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 1.2 Prisma Schema Updates

```prisma
model FinancialTransaction {
  id            String   @id @default(cuid())
  userId        String
  farmId        String
  fieldId       String?
  cropId        String?
  
  type          TransactionType
  category      String
  subcategory   String?
  
  amount        Decimal  @db.Decimal(12, 2)
  currency      String   @default("USD")
  quantity      Decimal? @db.Decimal(10, 2)
  unitPrice     Decimal? @db.Decimal(10, 2)
  
  transactionDate DateTime @db.Date
  paymentDate     DateTime? @db.Date
  
  operationId   String?
  marketPriceId String?
  
  notes         String?
  attachments   Json?
  tags          String[]
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  createdBy     String
  
  // Relations
  user          User     @relation(fields: [userId], references: [id])
  farm          Farm     @relation(fields: [farmId], references: [id])
  field         Field?   @relation(fields: [fieldId], references: [id])
  crop          Crop?    @relation(fields: [cropId], references: [id])
  operation     FarmOperation? @relation(fields: [operationId], references: [id])
  
  @@index([farmId, transactionDate])
  @@index([type, category])
  @@index([fieldId])
}

enum TransactionType {
  INCOME
  EXPENSE
}
```

## Phase 2: API Development (Week 1-2)

### 2.1 GraphQL Schema

```graphql
type FinancialTransaction {
  id: ID!
  type: TransactionType!
  category: String!
  subcategory: String
  amount: Float!
  currency: String!
  quantity: Float
  unitPrice: Float
  transactionDate: Date!
  paymentDate: Date
  notes: String
  attachments: [Attachment]
  tags: [String]
  
  # Relations
  farm: Farm!
  field: Field
  crop: Crop
  operation: FarmOperation
  
  # Computed fields
  formattedAmount: String!
  categoryIcon: String!
}

type FinancialSummary {
  totalIncome: Float!
  totalExpenses: Float!
  netProfit: Float!
  grossProfit: Float!
  profitMargin: Float!
  profitPerAcre: Float!
  
  # Breakdowns
  incomeByCategory: [CategoryBreakdown!]!
  expensesByCategory: [CategoryBreakdown!]!
  monthlyTrends: [MonthlyTrend!]!
  fieldProfitability: [FieldProfitability!]!
}

type FinancialForecast {
  id: ID!
  forecastDate: Date!
  predictedYield: Float!
  predictedPrice: Float!
  predictedRevenue: Float!
  confidenceScore: Float!
  assumptions: [ForecastAssumption!]!
}

# Queries
extend type Query {
  # Transactions
  financialTransactions(
    farmId: ID!
    startDate: Date
    endDate: Date
    type: TransactionType
    category: String
    fieldId: ID
    cropId: ID
    limit: Int
    offset: Int
  ): FinancialTransactionConnection!
  
  # Summary
  financialSummary(
    farmId: ID!
    startDate: Date!
    endDate: Date!
    groupBy: GroupingType
  ): FinancialSummary!
  
  # Forecasts
  financialForecasts(
    farmId: ID!
    fieldId: ID
    cropId: ID
    forecastHorizon: Int
  ): [FinancialForecast!]!
  
  # Reports
  generateFinancialReport(
    farmId: ID!
    reportType: ReportType!
    startDate: Date!
    endDate: Date!
    format: ExportFormat!
  ): ReportUrl!
}

# Mutations
extend type Mutation {
  # CRUD Operations
  createFinancialTransaction(input: CreateFinancialTransactionInput!): FinancialTransaction!
  updateFinancialTransaction(id: ID!, input: UpdateFinancialTransactionInput!): FinancialTransaction!
  deleteFinancialTransaction(id: ID!): Boolean!
  
  # Bulk Operations
  bulkImportTransactions(farmId: ID!, file: Upload!): BulkImportResult!
  
  # Forecasting
  generateFinancialForecast(farmId: ID!, options: ForecastOptions!): FinancialForecast!
}
```

### 2.2 REST API Endpoints

```typescript
// Financial Transactions
POST   /api/financial/transactions
GET    /api/financial/transactions
GET    /api/financial/transactions/:id
PUT    /api/financial/transactions/:id
DELETE /api/financial/transactions/:id

// Summary & Analytics
GET    /api/financial/summary
GET    /api/financial/trends
GET    /api/financial/field-profitability
GET    /api/financial/crop-profitability

// Forecasting
POST   /api/financial/forecast
GET    /api/financial/forecast/:farmId

// Reports
POST   /api/financial/reports/generate
GET    /api/financial/reports/:reportId

// Import/Export
POST   /api/financial/import
GET    /api/financial/export
```

## Phase 3: UI Components (Week 2-3)

### 3.1 Component Structure

```
components/
├── financial/
│   ├── dashboard/
│   │   ├── FinancialDashboard.tsx
│   │   ├── SeasonSnapshot.tsx
│   │   ├── QuickActions.tsx
│   │   └── ProfitTrendChart.tsx
│   ├── transactions/
│   │   ├── TransactionList.tsx
│   │   ├── TransactionForm.tsx
│   │   ├── TransactionModal.tsx
│   │   └── BulkImport.tsx
│   ├── analytics/
│   │   ├── PLSummaryTable.tsx
│   │   ├── FieldProfitabilityMap.tsx
│   │   ├── CategoryBreakdown.tsx
│   │   └── TrendAnalysis.tsx
│   ├── forecasting/
│   │   ├── ForecastView.tsx
│   │   ├── WhatIfSimulator.tsx
│   │   ├── BreakEvenAnalysis.tsx
│   │   └── ScenarioPlanner.tsx
│   └── reports/
│       ├── ReportGenerator.tsx
│       ├── ExportOptions.tsx
│       └── ReportTemplates.tsx
```

### 3.2 Key UI Components

```typescript
// Season Snapshot Component
export const SeasonSnapshot: React.FC = () => {
  const { data: summary } = useFinancialSummary({
    farmId: currentFarm.id,
    startDate: seasonStart,
    endDate: seasonEnd
  });

  return (
    <Card className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Net Profit"
          value={formatCurrency(summary?.netProfit)}
          change={summary?.profitChange}
          icon={<TrendingUp />}
        />
        <MetricCard
          title="Gross Profit"
          value={formatCurrency(summary?.grossProfit)}
          subtitle={`Margin: ${summary?.profitMargin}%`}
        />
        <MetricCard
          title="Profit per Acre"
          value={formatCurrency(summary?.profitPerAcre)}
          comparison="vs last season"
        />
      </div>
    </Card>
  );
};

// Transaction Form Component
export const TransactionForm: React.FC<TransactionFormProps> = ({ 
  type, 
  onSubmit,
  linkedOperation 
}) => {
  const form = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type,
      transactionDate: new Date(),
      ...getOperationDefaults(linkedOperation)
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {getCategories(type).map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <div className="flex items-center">
                        <cat.icon className="mr-2 h-4 w-4" />
                        {cat.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        
        {/* Additional form fields */}
      </form>
    </Form>
  );
};
```

## Phase 4: Integration & Automation (Week 3-4)

### 4.1 Operation Linking

```typescript
// Auto-link financial transactions to farm operations
export class FinancialOperationLinker {
  async linkTransaction(transaction: FinancialTransaction) {
    // Find matching operations
    const operations = await this.findMatchingOperations({
      farmId: transaction.farmId,
      date: transaction.transactionDate,
      type: this.getOperationType(transaction.category)
    });

    if (operations.length === 1) {
      // Auto-link if single match
      await this.linkToOperation(transaction.id, operations[0].id);
    } else if (operations.length > 1) {
      // Suggest matches to user
      return { suggestions: operations };
    }
  }

  private getOperationType(category: string): OperationType {
    const mapping = {
      'Seeds': 'PLANTING',
      'Fertilizer': 'FERTILIZING',
      'Harvest Labor': 'HARVESTING',
      'Pesticides': 'SPRAYING'
    };
    return mapping[category] || null;
  }
}
```

### 4.2 Market Price Integration

```typescript
// Auto-update revenue estimates with market prices
export class RevenueEstimator {
  async updateRevenueEstimates(farmId: string) {
    // Get current crops and expected yields
    const crops = await this.getCropsWithYieldEstimates(farmId);
    
    // Fetch latest market prices
    const prices = await this.marketPriceService.getLatestPrices(
      crops.map(c => c.cropType)
    );
    
    // Calculate revenue estimates
    const estimates = crops.map(crop => ({
      cropId: crop.id,
      fieldId: crop.fieldId,
      estimatedYield: crop.predictedYield,
      marketPrice: prices[crop.cropType],
      estimatedRevenue: crop.predictedYield * prices[crop.cropType],
      confidence: crop.yieldConfidence * 0.9 // Adjust for price volatility
    }));
    
    // Save estimates
    await this.saveRevenueEstimates(estimates);
  }
}
```

### 4.3 Weather-Adjusted Forecasting

```typescript
// Integrate weather predictions into financial forecasts
export class WeatherAdjustedForecast {
  async generateForecast(farmId: string, options: ForecastOptions) {
    // Get base yield predictions
    const baseYields = await this.mlService.predictYields(farmId);
    
    // Get weather forecast
    const weatherForecast = await this.weatherService.getForecast(
      farmId,
      options.forecastHorizon
    );
    
    // Adjust yields based on weather
    const adjustedYields = this.adjustYieldsForWeather(
      baseYields,
      weatherForecast
    );
    
    // Calculate financial impact
    const financialForecast = await this.calculateFinancialImpact({
      yields: adjustedYields,
      prices: await this.getPriceForecast(),
      costs: await this.getPlannedCosts(farmId)
    });
    
    return financialForecast;
  }
}
```

## Phase 5: ML Models & Intelligence (Week 4-5)

### 5.1 Financial Forecasting Model

```python
class FinancialForecastModel:
    def __init__(self):
        self.yield_model = self.load_yield_predictor()
        self.price_model = self.load_price_forecaster()
        self.cost_model = self.load_cost_estimator()
    
    def forecast_profitability(self, farm_data, forecast_horizon):
        # Predict yields using satellite and weather data
        yield_forecast = self.yield_model.predict({
            'ndvi_history': farm_data['ndvi'],
            'weather_forecast': farm_data['weather'],
            'crop_stage': farm_data['crop_stage'],
            'soil_conditions': farm_data['soil']
        })
        
        # Forecast market prices
        price_forecast = self.price_model.predict({
            'historical_prices': farm_data['price_history'],
            'market_indicators': farm_data['market_data'],
            'supply_demand': farm_data['supply_demand']
        })
        
        # Estimate costs
        cost_forecast = self.cost_model.predict({
            'planned_operations': farm_data['operations'],
            'input_prices': farm_data['input_costs'],
            'labor_rates': farm_data['labor_costs']
        })
        
        # Calculate profitability scenarios
        scenarios = self.generate_scenarios(
            yield_forecast,
            price_forecast,
            cost_forecast
        )
        
        return {
            'base_case': scenarios['expected'],
            'best_case': scenarios['optimistic'],
            'worst_case': scenarios['pessimistic'],
            'confidence_intervals': scenarios['confidence'],
            'key_drivers': self.identify_profit_drivers(scenarios)
        }
```

### 5.2 Cost Categorization Model

```python
class ExpenseCategorizer:
    def __init__(self):
        self.classifier = self.load_text_classifier()
        self.pattern_matcher = self.load_pattern_rules()
    
    def categorize_expense(self, transaction):
        # Extract features
        features = {
            'description': transaction['description'],
            'amount': transaction['amount'],
            'vendor': transaction['vendor'],
            'date': transaction['date'],
            'linked_operation': transaction.get('operation_type')
        }
        
        # Try pattern matching first
        category = self.pattern_matcher.match(features)
        
        if not category:
            # Use ML classifier
            category = self.classifier.predict(features)
        
        # Get subcategory
        subcategory = self.get_subcategory(category, features)
        
        return {
            'category': category,
            'subcategory': subcategory,
            'confidence': self.classifier.confidence,
            'suggested_tags': self.suggest_tags(category, features)
        }
```

## Phase 6: Testing & Security (Week 5-6)

### 6.1 Test Suite

```typescript
// Financial calculation tests
describe('Financial Calculations', () => {
  it('should calculate net profit correctly', async () => {
    const transactions = [
      { type: 'INCOME', amount: 10000 },
      { type: 'EXPENSE', amount: 3000 },
      { type: 'EXPENSE', amount: 2000 }
    ];
    
    const summary = await calculateSummary(transactions);
    expect(summary.netProfit).toBe(5000);
    expect(summary.profitMargin).toBe(50);
  });
  
  it('should handle multi-currency transactions', async () => {
    const transactions = [
      { type: 'INCOME', amount: 10000, currency: 'USD' },
      { type: 'EXPENSE', amount: 5000, currency: 'EUR' }
    ];
    
    const summary = await calculateSummary(transactions);
    expect(summary.totalIncome.USD).toBe(10000);
    expect(summary.exchangeRateUsed).toBeDefined();
  });
});

// API endpoint tests
describe('Financial API', () => {
  it('should validate transaction input', async () => {
    const invalidTransaction = {
      type: 'INVALID_TYPE',
      amount: -1000
    };
    
    const response = await request(app)
      .post('/api/financial/transactions')
      .send(invalidTransaction);
    
    expect(response.status).toBe(400);
    expect(response.body.errors).toContain('Invalid transaction type');
  });
});
```

### 6.2 Security Implementation

```typescript
// Financial data access control
export class FinancialAccessControl {
  async checkAccess(userId: string, farmId: string, action: string) {
    const userRole = await this.getUserRole(userId, farmId);
    
    const permissions = {
      OWNER: ['view', 'create', 'update', 'delete', 'export'],
      ACCOUNTANT: ['view', 'create', 'update', 'export'],
      MANAGER: ['view', 'create'],
      WORKER: []
    };
    
    if (!permissions[userRole]?.includes(action)) {
      throw new ForbiddenError(`User lacks permission for ${action}`);
    }
  }
  
  // Encrypt sensitive financial data
  async encryptFinancialData(data: any) {
    const sensitive_fields = ['amount', 'bankAccount', 'taxId'];
    return this.encryptFields(data, sensitive_fields);
  }
}
```

## Phase 7: Deployment & Monitoring (Week 6)

### 7.1 Performance Monitoring

```typescript
// Financial module metrics
export const financialMetrics = {
  // User engagement
  dailyActiveFinancialUsers: new Counter({
    name: 'financial_daily_active_users',
    help: 'Daily active users in financial module'
  }),
  
  // Data quality
  transactionCompleteness: new Gauge({
    name: 'transaction_completeness_score',
    help: 'Percentage of transactions with complete data'
  }),
  
  // Automation effectiveness
  autoLinkedTransactions: new Counter({
    name: 'auto_linked_transactions_total',
    help: 'Transactions automatically linked to operations'
  }),
  
  // Forecast accuracy
  forecastAccuracy: new Histogram({
    name: 'forecast_accuracy_percentage',
    help: 'Accuracy of financial forecasts vs actuals'
  })
};
```

### 7.2 Feature Flags

```typescript
// Progressive rollout configuration
export const financialFeatureFlags = {
  'financial-dashboard': {
    enabled: true,
    rolloutPercentage: 100
  },
  'auto-categorization': {
    enabled: true,
    rolloutPercentage: 50,
    betaUsers: ['farm-123', 'farm-456']
  },
  'ai-forecasting': {
    enabled: false,
    rolloutPercentage: 0,
    requiredPlan: 'premium'
  },
  'multi-currency': {
    enabled: true,
    rolloutPercentage: 100,
    regions: ['US', 'CA', 'EU']
  }
};
```

## Implementation Timeline

**Week 1**: Database schema, basic API endpoints
**Week 2**: Core UI components, transaction CRUD
**Week 3**: Dashboard, analytics, integration with operations
**Week 4**: ML models, forecasting, automation
**Week 5**: Testing, security, performance optimization
**Week 6**: Deployment, monitoring, documentation

## Success Criteria

1. **Technical Performance**
   - <200ms response time for financial queries
   - 99.9% uptime for financial services
   - <2% error rate in auto-categorization

2. **User Adoption**
   - 50% of active users access financial module within first month
   - 80% transaction completion rate
   - 4.5+ user satisfaction rating

3. **Business Impact**
   - 30% reduction in manual bookkeeping time
   - 85% forecast accuracy within 10% margin
   - 20% increase in user retention

## Risk Mitigation

1. **Data Security**: Implement encryption, access controls, audit logging
2. **Accuracy**: Manual review options, confidence scores, validation rules
3. **Performance**: Caching, pagination, query optimization
4. **User Trust**: Clear data sources, explainable calculations, export capabilities