const pool = require("../config/db");

/* ================= GET PROFILE ================= */
exports.getProfile = async (req, res) => {
  try {
    const requestedId = Number(req.params.id);
    const loggedInUserId = Number(req.user?.id);
    const loggedInUserRole = req.user?.role;

    // Employee can view only own profile, admin can view any profile
    if (loggedInUserRole !== "admin" && requestedId !== loggedInUserId) {
      return res.status(403).json({ message: "Unauthorized access to profile" });
    }

    const result = await pool.query(
      "SELECT * FROM employee_profiles WHERE user_id = $1",
      [requestedId]
    );

    if (result.rows.length === 0) {
      return res.json({});
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.log("Get profile error:", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

/* ================= UPDATE PROFILE ================= */
exports.updateProfile = async (req, res) => {
  const client = await pool.connect();

  try {
    const loggedInUserId = Number(req.user?.id);
    const loggedInUserRole = req.user?.role;
    const bodyUserId = Number(req.body.user_id);

    // Employee can update only own profile, admin can update any profile
    if (loggedInUserRole !== "admin" && bodyUserId !== loggedInUserId) {
      return res.status(403).json({ message: "Unauthorized profile update" });
    }

    const targetUserId = loggedInUserRole === "admin" ? bodyUserId : loggedInUserId;

    const {
      full_name,
      dob,
      gender,
      marital_status,
      nationality,
      email,
      phone,
      alternate_phone,
      address,
      city,
      state,
      pincode,
      kin_name,
      kin_relationship,
      kin_phone,
      kin_address,
      qualification,
      institution,
      year_of_passing,
      guarantor_name,
      guarantor_phone,
      guarantor_address,
      father_name,
      mother_name,
      spouse_name,
      children_count,
      employee_id,
      department,
      designation,
      joining_date,
      bank_name,
      account_number,
      ifsc_code,
      pan_number,
    } = req.body;

    await client.query("BEGIN");

    const existing = await client.query(
      "SELECT * FROM employee_profiles WHERE user_id = $1",
      [targetUserId]
    );

    let profileResult;

    if (existing.rows.length > 0) {
      profileResult = await client.query(
        `
        UPDATE employee_profiles
        SET
          full_name = $1,
          dob = $2,
          gender = $3,
          marital_status = $4,
          nationality = $5,
          email = $6,
          phone = $7,
          alternate_phone = $8,
          address = $9,
          city = $10,
          state = $11,
          pincode = $12,
          kin_name = $13,
          kin_relationship = $14,
          kin_phone = $15,
          kin_address = $16,
          qualification = $17,
          institution = $18,
          year_of_passing = $19,
          guarantor_name = $20,
          guarantor_phone = $21,
          guarantor_address = $22,
          father_name = $23,
          mother_name = $24,
          spouse_name = $25,
          children_count = $26,
          employee_id = $27,
          department = $28,
          designation = $29,
          joining_date = $30,
          bank_name = $31,
          account_number = $32,
          ifsc_code = $33,
          pan_number = $34,
          updated_at = NOW()
        WHERE user_id = $35
        RETURNING *
        `,
        [
          full_name,
          dob,
          gender,
          marital_status,
          nationality,
          email,
          phone,
          alternate_phone,
          address,
          city,
          state,
          pincode,
          kin_name,
          kin_relationship,
          kin_phone,
          kin_address,
          qualification,
          institution,
          year_of_passing,
          guarantor_name,
          guarantor_phone,
          guarantor_address,
          father_name,
          mother_name,
          spouse_name,
          children_count,
          employee_id,
          department,
          designation,
          joining_date,
          bank_name,
          account_number,
          ifsc_code,
          pan_number,
          targetUserId,
        ]
      );
    } else {
      profileResult = await client.query(
        `
        INSERT INTO employee_profiles (
          user_id,
          full_name,
          dob,
          gender,
          marital_status,
          nationality,
          email,
          phone,
          alternate_phone,
          address,
          city,
          state,
          pincode,
          kin_name,
          kin_relationship,
          kin_phone,
          kin_address,
          qualification,
          institution,
          year_of_passing,
          guarantor_name,
          guarantor_phone,
          guarantor_address,
          father_name,
          mother_name,
          spouse_name,
          children_count,
          employee_id,
          department,
          designation,
          joining_date,
          bank_name,
          account_number,
          ifsc_code,
          pan_number
        )
        VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
          $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
          $21,$22,$23,$24,$25,$26,$27,$28,$29,$30,
          $31,$32,$33,$34,$35
        )
        RETURNING *
        `,
        [
          targetUserId,
          full_name,
          dob,
          gender,
          marital_status,
          nationality,
          email,
          phone,
          alternate_phone,
          address,
          city,
          state,
          pincode,
          kin_name,
          kin_relationship,
          kin_phone,
          kin_address,
          qualification,
          institution,
          year_of_passing,
          guarantor_name,
          guarantor_phone,
          guarantor_address,
          father_name,
          mother_name,
          spouse_name,
          children_count,
          employee_id,
          department,
          designation,
          joining_date,
          bank_name,
          account_number,
          ifsc_code,
          pan_number,
        ]
      );
    }

    // Sync important fields into users table also
    await client.query(
      `
      UPDATE users
      SET
        name = COALESCE($1, name),
        email = COALESCE($2, email),
        phone = COALESCE($3, phone),
        employee_id = COALESCE($4, employee_id),
        dept = COALESCE($5, dept),
        job_title = COALESCE($6, job_title),
        start_date = COALESCE($7, start_date)
      WHERE id = $8
      `,
      [
        full_name || null,
        email || null,
        phone || null,
        employee_id || null,
        department || null,
        designation || null,
        joining_date || null,
        targetUserId,
      ]
    );

    await client.query("COMMIT");

    res.json({
      message:
        existing.rows.length > 0
          ? "Profile updated successfully"
          : "Profile created successfully",
      profile: profileResult.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.log("Update profile error:", error);
    res.status(500).json({ message: "Failed to save profile" });
  } finally {
    client.release();
  }
};