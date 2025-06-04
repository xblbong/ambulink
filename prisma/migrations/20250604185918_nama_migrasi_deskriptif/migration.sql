-- CreateEnum
CREATE TYPE "role" AS ENUM ('admin', 'user');

-- CreateEnum
CREATE TYPE "tipe_instansi" AS ENUM ('rumah_sakit', 'pmi', 'klinik', 'lainnya');

-- CreateEnum
CREATE TYPE "jenis_layanan" AS ENUM ('gawat_darurat', 'non_gawat_darurat', 'jenazah');

-- CreateEnum
CREATE TYPE "status" AS ENUM ('gratis', 'berbayar');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "nama" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" "role" NOT NULL DEFAULT 'user',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ambulans" (
    "id" SERIAL NOT NULL,
    "nama" VARCHAR(100) NOT NULL,
    "tipe_instansi" "tipe_instansi" NOT NULL,
    "jenis_layanan" "jenis_layanan" NOT NULL,
    "status" "status" NOT NULL,
    "harga" DECIMAL(10,2),
    "provinsi" VARCHAR(50) NOT NULL,
    "kota" VARCHAR(50) NOT NULL,
    "alamat" TEXT NOT NULL,
    "latitude" DECIMAL(10,8) NOT NULL,
    "longitude" DECIMAL(11,8) NOT NULL,
    "kontak" VARCHAR(20) NOT NULL,
    "whatsapp" VARCHAR(20),
    "fasilitas" TEXT,
    "deskripsi" TEXT,
    "jam_operasional" VARCHAR(100),
    "user_id" INTEGER,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "rating" DECIMAL(2,1) NOT NULL DEFAULT 0.0,
    "jumlah_rating" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ambulans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" SERIAL NOT NULL,
    "ambulans_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "komentar" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "ambulans" ADD CONSTRAINT "ambulans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_ambulans_id_fkey" FOREIGN KEY ("ambulans_id") REFERENCES "ambulans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
