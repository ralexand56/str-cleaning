import { type ClientSchema, a, defineData } from '@aws-amplify/backend'

const schema = a.schema({
  JobType: a.enum([
    'STR_TURNOVER',
    'STR_DEEP',
    'STR_SEASONAL',
    'STR_STARTUP',
    'STR_SUBSCRIPTION_STANDARD',
    'STR_SUBSCRIPTION_PREMIUM',
    'RESIDENTIAL_FIRST_VISIT',
    'RESIDENTIAL_RECURRING',
    'MOVE_IN_OUT',
    'POST_CONSTRUCTION',
    'CONTACT_INQUIRY',
    'WALKTHROUGH_APPOINTMENT',
  ]),
  JobSource: a.enum(['BOOKING_FORM', 'CONTACT_FORM', 'APPOINTMENT_SCHEDULER', 'ADMIN_MANUAL']),
  JobStatus: a.enum(['NEW', 'CONTACTED', 'QUOTED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELED']),
  PropertyCategory: a.enum(['STR', 'RESIDENTIAL']),
  SenderType: a.enum(['ADMIN', 'WORKER', 'CUSTOMER', 'SYSTEM']),
  ChargeStatus: a.enum(['PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED']),

  Customer: a
    .model({
      cognitoSub: a.string(), // set once a guest customer signs up and claims their account
      firstName: a.string().required(),
      lastName: a.string().required(),
      email: a.string().required(),
      phone: a.string(),
      stripeCustomerId: a.string(),
      jobs: a.hasMany('Job', 'customerId'),
      paymentMethods: a.hasMany('PaymentMethod', 'customerId'),
    })
    // publicApiKey read/update (server-only) backs the account-claim flow: a signed-in customer's
    // own server action looks up guest rows by their *verified* Cognito email and links cognitoSub.
    .authorization((allow) => [
      allow.group('Admins'),
      allow.ownerDefinedIn('cognitoSub').to(['read']),
      allow.publicApiKey().to(['create', 'read', 'update']),
    ])
    .secondaryIndexes((idx) => [idx('cognitoSub'), idx('email')]),

  Worker: a
    .model({
      cognitoSub: a.string().required(),
      firstName: a.string().required(),
      lastName: a.string().required(),
      email: a.string().required(),
      phone: a.string(),
      active: a.boolean().default(true),
      jobs: a.hasMany('Job', 'assignedWorkerId'),
    })
    .authorization((allow) => [allow.group('Admins'), allow.ownerDefinedIn('cognitoSub').to(['read'])])
    .secondaryIndexes((idx) => [idx('cognitoSub')]),

  Job: a
    .model({
      type: a.ref('JobType').required(),
      source: a.ref('JobSource').required(),
      status: a.ref('JobStatus'), // application code sets 'NEW' on create
      category: a.ref('PropertyCategory'),

      customerId: a.id(),
      customer: a.belongsTo('Customer', 'customerId'),
      // Snapshot contact fields, kept even when no Customer link exists yet (e.g. a raw contact-form inquiry).
      firstName: a.string(),
      lastName: a.string(),
      email: a.string(),
      phone: a.string(),

      propertySize: a.string(), // e.g. '3b 2.5b' or 'medium'
      beds: a.integer(),
      baths: a.float(),
      sqft: a.integer(),
      address: a.string(),
      unit: a.string(),
      city: a.string(),
      state: a.string(),
      zip: a.string(),

      frequency: a.string(), // 'One-time' | 'Weekly' | 'Bi-weekly' | 'Monthly'
      addOns: a.json(), // [{ id, qty, label, unitPrice }]
      emergencySameDay: a.boolean(),
      scheduledDate: a.date(),
      scheduledTimeWindow: a.string(),

      estimatedLow: a.integer(),
      estimatedHigh: a.integer(),
      quotedTotal: a.integer(),
      actualTotal: a.integer(),

      notes: a.string(), // customer's own free-text notes at booking time
      rawMessage: a.string(), // CONTACT_INQUIRY message body

      assignedWorkerId: a.id(),
      assignedWorker: a.belongsTo('Worker', 'assignedWorkerId'),
      assignedWorkerSub: a.string(), // denormalized Cognito sub, drives owner-based auth for workers

      messages: a.hasMany('Message', 'jobId'),
      notesLog: a.hasMany('JobNote', 'jobId'),
      charges: a.hasMany('Charge', 'jobId'),
    })
    // publicApiKey 'read' (server-only) backs the customer account page listing a customer's own
    // jobs by customerId — scoped in application code, not by the data layer, same tradeoff as
    // Message/JobNote above.
    .authorization((allow) => [
      allow.group('Admins'),
      allow.ownerDefinedIn('assignedWorkerSub').to(['read', 'update']),
      allow.publicApiKey().to(['create', 'read']),
    ])
    .secondaryIndexes((idx) => [idx('assignedWorkerId'), idx('status'), idx('customerId')]),

  Message: a
    .model({
      jobId: a.id().required(),
      job: a.belongsTo('Job', 'jobId'),
      senderType: a.ref('SenderType').required(),
      senderSub: a.string(), // Cognito sub for ADMIN/WORKER senders, null for CUSTOMER/SYSTEM
      toEmail: a.string(), // set when an admin message should also go out over SES
      body: a.string().required(),
      createdAt: a.datetime(),
    })
    // Workers get blanket read/create (not scoped per-job — Amplify can't express "readable by
    // whoever is assigned to the parent Job" declaratively without a custom resolver). The app
    // layer scopes access: a worker's UI only ever queries messages for jobs their own Job.get
    // (which *is* correctly row-scoped via assignedWorkerSub) confirms they're assigned to.
    .authorization((allow) => [
      allow.group('Admins'),
      allow.group('Workers').to(['read', 'create']),
      // 'read' lets the signed customer reply-link page (app/messages/[token]) show the thread
      // for that one job; the apiKey itself is a server-only secret, never sent to the browser.
      allow.publicApiKey().to(['read', 'create']),
    ]),

  JobNote: a
    .model({
      jobId: a.id().required(),
      job: a.belongsTo('Job', 'jobId'),
      authorSub: a.string().required(),
      authorRole: a.string().required(), // 'ADMIN' | 'WORKER'
      body: a.string().required(),
    })
    // Same blanket-group tradeoff as Message — see comment above.
    .authorization((allow) => [allow.group('Admins'), allow.group('Workers').to(['read', 'create'])]),

  PaymentMethod: a
    .model({
      customerId: a.id().required(),
      customer: a.belongsTo('Customer', 'customerId'),
      stripePaymentMethodId: a.string().required(),
      brand: a.string(),
      last4: a.string(),
      expMonth: a.integer(),
      expYear: a.integer(),
      isDefault: a.boolean().default(true),
    })
    .authorization((allow) => [allow.group('Admins'), allow.publicApiKey().to(['create', 'read'])]),

  Charge: a
    .model({
      jobId: a.id(),
      job: a.belongsTo('Job', 'jobId'),
      customerId: a.id().required(),
      stripePaymentIntentId: a.string().required(),
      amountCents: a.integer().required(),
      status: a.ref('ChargeStatus'), // application code sets 'PENDING' on create
      description: a.string(),
      createdBySub: a.string(), // admin who initiated the charge
    })
    // publicApiKey read/update is scoped to the Stripe webhook route (server-only, signature-verified)
    // reconciling PaymentIntent status — it never creates Charge rows.
    .authorization((allow) => [allow.group('Admins'), allow.publicApiKey().to(['read', 'update'])]),
})

export type Schema = ClientSchema<typeof schema>

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
    apiKeyAuthorizationMode: { expiresInDays: 30 },
  },
})
