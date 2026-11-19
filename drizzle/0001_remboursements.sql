CREATE TABLE "repayments" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "repayments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"from_member" text NOT NULL,
	"to_member" text NOT NULL,
	"amount_cents" integer NOT NULL,
	"state_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "repayments_state_key_unique" UNIQUE("state_key"),
	CONSTRAINT "repayments_amount_positive" CHECK ("repayments"."amount_cents" > 0),
	CONSTRAINT "repayments_distinct_members" CHECK ("repayments"."from_member" <> "repayments"."to_member")
);
