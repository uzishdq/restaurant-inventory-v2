CREATE TYPE "public"."notification_recipient" AS ENUM('USER', 'SUPPLIER');--> statement-breakpoint
CREATE TYPE "public"."notification_ref" AS ENUM('PROCUREMENT', 'PURCHASE', 'RECEIPT', 'RETURN');--> statement-breakpoint
CREATE TYPE "public"."procurement_status" AS ENUM('DRAFT', 'ON_PROGRESS', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."production_status" AS ENUM('DRAFT', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."purchase_status" AS ENUM('DRAFT', 'SENT', 'RECEIVED', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."status_notification" AS ENUM('PENDING', 'ONPROGRESS', 'SENT', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."status_transaction" AS ENUM('PENDING', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."type_item" AS ENUM('RAW_MATERIAL', 'WORK_IN_PROGRESS', 'FINISHED_GOOD');--> statement-breakpoint
CREATE TYPE "public"."type_movement" AS ENUM('IN', 'OUT');--> statement-breakpoint
CREATE TYPE "public"."type_transaction" AS ENUM('PURCHASE', 'PRODUCTION', 'SALES', 'ADJUSTMENT');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('SUPER_ADMIN', 'ADMIN', 'HEADKITCHEN', 'KITCHEN', 'MANAGER');--> statement-breakpoint
CREATE TABLE "category" (
	"id_category" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	CONSTRAINT "category_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "goods_receipt_item" (
	"id_receipt_item" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"receipt_id" varchar(20) NOT NULL,
	"item_id" varchar(20) NOT NULL,
	"qty_received" numeric NOT NULL,
	"qty_damaged" numeric DEFAULT '0' NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "goods_receipt" (
	"id_receipt" varchar(20) PRIMARY KEY NOT NULL,
	"purchase_id" varchar(20) NOT NULL,
	"received_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "item_bom_detail" (
	"id_bom_detail" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bom_id" uuid NOT NULL,
	"raw_item_id" varchar(20) NOT NULL,
	"qty" numeric NOT NULL
);
--> statement-breakpoint
CREATE TABLE "item_bom" (
	"id_bom" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_id" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "item_movement" (
	"id_movement" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transaction_id" varchar(20),
	"item_id" varchar(20) NOT NULL,
	"type_movement" "type_movement" NOT NULL,
	"quantity" numeric NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "item" (
	"id_item" varchar(20) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"unit_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"type_item" "type_item" DEFAULT 'RAW_MATERIAL' NOT NULL,
	"min_stock" numeric DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "item_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id_notification" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipient_type" "notification_recipient" NOT NULL,
	"user_id" uuid,
	"supplier_id" uuid,
	"ref_type" "notification_ref" NOT NULL,
	"ref_id" varchar(20) NOT NULL,
	"message" text NOT NULL,
	"status" "status_notification" DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "procurement_item" (
	"id_procurement_item" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"procurement_id" varchar(20) NOT NULL,
	"item_id" varchar(20) NOT NULL,
	"qty_requested" numeric NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "procurement" (
	"id_procurement" varchar(20) PRIMARY KEY NOT NULL,
	"requested_by" uuid NOT NULL,
	"status" "procurement_status" DEFAULT 'DRAFT' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "production_material" (
	"id_production_material" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"production_order_id" varchar(20) NOT NULL,
	"bom_detail_id" uuid NOT NULL,
	"item_id" varchar(20) NOT NULL,
	"qty_required" numeric NOT NULL,
	"qty_used" numeric DEFAULT '0' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "production_order" (
	"id_production_order" varchar(20) PRIMARY KEY NOT NULL,
	"procurement_id" varchar(20) NOT NULL,
	"procurement_item_id" uuid NOT NULL,
	"item_id" varchar(20) NOT NULL,
	"qty_target" numeric NOT NULL,
	"qty_produced" numeric DEFAULT '0' NOT NULL,
	"status" "production_status" DEFAULT 'DRAFT' NOT NULL,
	"scheduled_date" timestamp,
	"completed_date" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "production_record" (
	"id_production_record" varchar(20) PRIMARY KEY NOT NULL,
	"production_order_id" varchar(20) NOT NULL,
	"produced_by" uuid NOT NULL,
	"qty_produced" numeric NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchase_item" (
	"id_purchase_item" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"purchase_id" varchar(20) NOT NULL,
	"procurement_item_id" uuid NOT NULL,
	"item_id" varchar(20) NOT NULL,
	"qty_ordered" numeric NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchase" (
	"id_purchase" varchar(20) PRIMARY KEY NOT NULL,
	"procurement_id" varchar(20) NOT NULL,
	"supplier_id" uuid NOT NULL,
	"status" "purchase_status" DEFAULT 'DRAFT' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "supplier" (
	"id_supplier" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"store" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"phone" varchar(20),
	"address" text,
	CONSTRAINT "supplier_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "transaction" (
	"id_transaction" varchar(20) PRIMARY KEY NOT NULL,
	"type_transaction" "type_transaction" NOT NULL,
	"status_transaction" "status_transaction" DEFAULT 'PENDING' NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "unit" (
	"id_unit" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(50) NOT NULL,
	CONSTRAINT "unit_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id_user" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"username" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"role" "user_role" DEFAULT 'HEADKITCHEN' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_username_unique" UNIQUE("username"),
	CONSTRAINT "user_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
ALTER TABLE "goods_receipt_item" ADD CONSTRAINT "goods_receipt_item_receipt_id_goods_receipt_id_receipt_fk" FOREIGN KEY ("receipt_id") REFERENCES "public"."goods_receipt"("id_receipt") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goods_receipt_item" ADD CONSTRAINT "goods_receipt_item_item_id_item_id_item_fk" FOREIGN KEY ("item_id") REFERENCES "public"."item"("id_item") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goods_receipt" ADD CONSTRAINT "goods_receipt_purchase_id_purchase_id_purchase_fk" FOREIGN KEY ("purchase_id") REFERENCES "public"."purchase"("id_purchase") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goods_receipt" ADD CONSTRAINT "goods_receipt_received_by_user_id_user_fk" FOREIGN KEY ("received_by") REFERENCES "public"."user"("id_user") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_bom_detail" ADD CONSTRAINT "item_bom_detail_bom_id_item_bom_id_bom_fk" FOREIGN KEY ("bom_id") REFERENCES "public"."item_bom"("id_bom") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "item_bom_detail" ADD CONSTRAINT "item_bom_detail_raw_item_id_item_id_item_fk" FOREIGN KEY ("raw_item_id") REFERENCES "public"."item"("id_item") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_bom" ADD CONSTRAINT "item_bom_item_id_item_id_item_fk" FOREIGN KEY ("item_id") REFERENCES "public"."item"("id_item") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "item_movement" ADD CONSTRAINT "item_movement_transaction_id_transaction_id_transaction_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transaction"("id_transaction") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_movement" ADD CONSTRAINT "item_movement_item_id_item_id_item_fk" FOREIGN KEY ("item_id") REFERENCES "public"."item"("id_item") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "item" ADD CONSTRAINT "item_unit_id_unit_id_unit_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."unit"("id_unit") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "item" ADD CONSTRAINT "item_category_id_category_id_category_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id_category") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_user_id_user_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id_user") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_supplier_id_supplier_id_supplier_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."supplier"("id_supplier") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "procurement_item" ADD CONSTRAINT "procurement_item_procurement_id_procurement_id_procurement_fk" FOREIGN KEY ("procurement_id") REFERENCES "public"."procurement"("id_procurement") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "procurement_item" ADD CONSTRAINT "procurement_item_item_id_item_id_item_fk" FOREIGN KEY ("item_id") REFERENCES "public"."item"("id_item") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "procurement" ADD CONSTRAINT "procurement_requested_by_user_id_user_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."user"("id_user") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "production_material" ADD CONSTRAINT "production_material_production_order_id_production_order_id_production_order_fk" FOREIGN KEY ("production_order_id") REFERENCES "public"."production_order"("id_production_order") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "production_material" ADD CONSTRAINT "production_material_bom_detail_id_item_bom_detail_id_bom_detail_fk" FOREIGN KEY ("bom_detail_id") REFERENCES "public"."item_bom_detail"("id_bom_detail") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "production_material" ADD CONSTRAINT "production_material_item_id_item_id_item_fk" FOREIGN KEY ("item_id") REFERENCES "public"."item"("id_item") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "production_order" ADD CONSTRAINT "production_order_procurement_id_procurement_id_procurement_fk" FOREIGN KEY ("procurement_id") REFERENCES "public"."procurement"("id_procurement") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "production_order" ADD CONSTRAINT "production_order_procurement_item_id_procurement_item_id_procurement_item_fk" FOREIGN KEY ("procurement_item_id") REFERENCES "public"."procurement_item"("id_procurement_item") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "production_order" ADD CONSTRAINT "production_order_item_id_item_id_item_fk" FOREIGN KEY ("item_id") REFERENCES "public"."item"("id_item") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "production_record" ADD CONSTRAINT "production_record_production_order_id_production_order_id_production_order_fk" FOREIGN KEY ("production_order_id") REFERENCES "public"."production_order"("id_production_order") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "production_record" ADD CONSTRAINT "production_record_produced_by_user_id_user_fk" FOREIGN KEY ("produced_by") REFERENCES "public"."user"("id_user") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "purchase_item" ADD CONSTRAINT "purchase_item_purchase_id_purchase_id_purchase_fk" FOREIGN KEY ("purchase_id") REFERENCES "public"."purchase"("id_purchase") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "purchase_item" ADD CONSTRAINT "purchase_item_procurement_item_id_procurement_item_id_procurement_item_fk" FOREIGN KEY ("procurement_item_id") REFERENCES "public"."procurement_item"("id_procurement_item") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "purchase_item" ADD CONSTRAINT "purchase_item_item_id_item_id_item_fk" FOREIGN KEY ("item_id") REFERENCES "public"."item"("id_item") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase" ADD CONSTRAINT "purchase_procurement_id_procurement_id_procurement_fk" FOREIGN KEY ("procurement_id") REFERENCES "public"."procurement"("id_procurement") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "purchase" ADD CONSTRAINT "purchase_supplier_id_supplier_id_supplier_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."supplier"("id_supplier") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_user_id_user_id_user_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id_user") ON DELETE cascade ON UPDATE cascade;