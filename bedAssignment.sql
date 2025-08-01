USE bed_AssignmentTestingDB;
GO

/******************************************************************************
* 1. Drop ALL Foreign Keys (avoids dependency errors on DROP TABLE)
******************************************************************************/
DECLARE @fk_sql NVARCHAR(MAX) = N'';
SELECT @fk_sql += 'ALTER TABLE [' + SCHEMA_NAME(t.schema_id) + '].[' + t.name + '] DROP CONSTRAINT [' + fk.name + '];'
FROM sys.foreign_keys fk
INNER JOIN sys.tables t ON fk.parent_object_id = t.object_id;
EXEC sp_executesql @fk_sql;

/******************************************************************************
* 2. Drop ALL Tables (order doesn¡¯t matter now)
******************************************************************************/
DECLARE @tbl_sql NVARCHAR(MAX) = N'';
SELECT @tbl_sql += 'DROP TABLE IF EXISTS [' + SCHEMA_NAME(schema_id) + '].[' + name + '];'
FROM sys.tables;
EXEC sp_executesql @tbl_sql;

/******************************************************************************
* 3. Recreate Tables (exactly as you provided)
******************************************************************************/

-- Users Table
CREATE TABLE Users (
    user_id INT PRIMARY KEY IDENTITY(1,1),
    username NVARCHAR(50) NOT NULL UNIQUE,
    email NVARCHAR(100),
    passwordHash NVARCHAR(255) NOT NULL,
    role NVARCHAR(20) NOT NULL CHECK (role IN ('member', 'admin'))
);

-- Profiles Table
CREATE TABLE Profiles (
    profile_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    name NVARCHAR(100) NOT NULL UNIQUE,
    hobbies NVARCHAR(MAX),
    age INT,
    description NVARCHAR(MAX),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- RevokedTokens Table
CREATE TABLE RevokedTokens (
    token_id NVARCHAR(255) PRIMARY KEY,
    expiration_date DATETIME NOT NULL,
    revoked_at DATETIME DEFAULT GETDATE()
);

-- user_points Table
CREATE TABLE user_points (
    user_id INT NOT NULL PRIMARY KEY,
    points INT NOT NULL DEFAULT 0,
    updated_at DATETIME NOT NULL DEFAULT GETDATE()
);

-- vouchers Table
CREATE TABLE vouchers (
    voucher_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    title NVARCHAR(100) NOT NULL,
    description NVARCHAR(255) NULL,
    cost_points INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT GETDATE()
);

-- voucher_cart Table
CREATE TABLE voucher_cart (
    cart_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    user_id INT NOT NULL,
    voucher_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    added_at DATETIME NOT NULL DEFAULT GETDATE()
);

-- user_vouchers Table
CREATE TABLE user_vouchers (
    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    user_id INT NOT NULL,
    voucher_id INT NOT NULL,
    quantity INT NOT NULL,
    redeemed_at DATETIME NOT NULL DEFAULT GETDATE()
);

-- user_voucher_history Table
CREATE TABLE user_voucher_history (
    history_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    user_id INT NOT NULL,
    voucher_id INT NOT NULL,
    voucher_title NVARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    redeemed_at DATETIME NOT NULL DEFAULT GETDATE()
);

-- video_tasks Table
CREATE TABLE video_tasks (
    task_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    title NVARCHAR(150) NOT NULL,
    description NVARCHAR(255) NULL,
    youtube_id NVARCHAR(50) NOT NULL,
    point_value INT NOT NULL,
    category NVARCHAR(50) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT GETDATE()
);

-- video_watches Table
CREATE TABLE video_watches (
    watch_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    user_id INT NOT NULL,
    task_id INT NOT NULL,
    watched_at DATETIME NOT NULL DEFAULT GETDATE()
);

-- Medications Table
CREATE TABLE Medications (
    medication_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    user_id INT NOT NULL,
    name NVARCHAR(100) NOT NULL,
    dosage NVARCHAR(50) NOT NULL,
    instructions NVARCHAR(255),
    time VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE
);

-- MedicationHistory Table
CREATE TABLE MedicationHistory (
    history_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    medication_id INT NOT NULL,
    taken_at DATETIME NOT NULL
);

-- UserFriends Table
CREATE TABLE UserFriends (
    user_id INT NOT NULL,
    friend_id INT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at DATETIME DEFAULT GETDATE(),
    nick_name VARCHAR(500),
    description VARCHAR(MAX),
    PRIMARY KEY (user_id, friend_id)
);

-- Event Table
CREATE TABLE Event (
    event_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    time DATETIME,
    description TEXT,
    image NVARCHAR(MAX),
    fee VARCHAR(50),
    type VARCHAR(100),
    detail VARCHAR(100),
    photo TEXT
);

-- event_signup Table
CREATE TABLE event_signup (
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    status VARCHAR(20),
    PRIMARY KEY (user_id, event_id)
);

-- Groups Table
CREATE TABLE Groups (
    group_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    create_date DATETIME2(0) DEFAULT SYSDATETIME() NOT NULL,
    owner_id INT NOT NULL,
    description NVARCHAR(500) NULL,
    photo_url NVARCHAR(MAX) NULL,
    is_public BIT DEFAULT 1 NOT NULL,
    member_count INT DEFAULT 1 NOT NULL,
    last_activity DATETIME2(0) NULL
);

-- GroupMembers Table
CREATE TABLE GroupMembers (
    group_id INT NOT NULL,
    user_id INT NOT NULL,
    join_date DATETIME2(0) DEFAULT SYSDATETIME() NOT NULL,
    role VARCHAR(10) CHECK (role IN ('member', 'admin', 'owner')) DEFAULT 'member' NOT NULL,
    is_active BIT NULL,
    notification_preferences TINYINT NULL,
    PRIMARY KEY (group_id, user_id)
);

-- GroupAnnouncements Table
CREATE TABLE GroupAnnouncements (
    announcement_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    group_id INT NOT NULL,
    author_id INT NOT NULL,
    title NVARCHAR(100) NOT NULL,
    content NVARCHAR(MAX) NOT NULL,
    post_date DATETIME2(0) DEFAULT SYSDATETIME() NOT NULL,
    is_pinned BIT DEFAULT 0 NOT NULL
);

-- MailBox Table
CREATE TABLE MailBox (
    mail_box_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    user_id INT NOT NULL,
    message NVARCHAR(MAX) NOT NULL,
    receive_date DATETIME DEFAULT GETDATE()
);

-- PrivateChats Table
CREATE TABLE PrivateChats (
    chat_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    message NVARCHAR(MAX) NOT NULL,
    sent_at DATETIME DEFAULT GETDATE()
);

-- GroupChats Table
CREATE TABLE GroupChats (
    chat_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    group_id INT NOT NULL,
    sender_id INT NOT NULL,
    message NVARCHAR(MAX) NOT NULL,
    sent_at DATETIME DEFAULT GETDATE()
);

-- food_items Table
CREATE TABLE food_items (
    food_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    food_name NVARCHAR(100) NULL,
    calories_per_unit INT NULL
);

-- recommended_calories Table
CREATE TABLE recommended_calories (
    age_min INT NULL,
    age_max INT NULL,
    recommended_calories INT NULL
);

-- daily_calorie_intake Table
CREATE TABLE daily_calorie_intake (
    intake_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    user_id INT NULL,
    [date] DATE NULL,
    meal_type NVARCHAR(50) NULL,
    food_id INT NULL,
    quantity INT NULL,
    total_calories INT NULL,
    [time] TIME(7) NULL
);

-- WeatherAlerts Table
CREATE TABLE WeatherAlerts(
    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    user_id INT NULL,
    weather_type VARCHAR(50) NULL,
    alert_time INT NULL,
    created_at DATETIME NULL DEFAULT GETDATE()
);

-- (Foreign Keys: run separately for clarity)
ALTER TABLE Profiles ADD FOREIGN KEY (user_id) REFERENCES Users(user_id);
ALTER TABLE user_points ADD FOREIGN KEY(user_id) REFERENCES Users(user_id);
ALTER TABLE voucher_cart ADD FOREIGN KEY(user_id) REFERENCES Users(user_id);
ALTER TABLE voucher_cart ADD FOREIGN KEY(voucher_id) REFERENCES vouchers(voucher_id);
ALTER TABLE user_vouchers ADD FOREIGN KEY(user_id) REFERENCES Users(user_id);
ALTER TABLE user_vouchers ADD FOREIGN KEY(voucher_id) REFERENCES vouchers(voucher_id);
ALTER TABLE user_voucher_history ADD FOREIGN KEY(user_id) REFERENCES Users(user_id);
ALTER TABLE user_voucher_history ADD FOREIGN KEY(voucher_id) REFERENCES vouchers(voucher_id);
ALTER TABLE video_watches ADD FOREIGN KEY(user_id) REFERENCES Users(user_id);
ALTER TABLE video_watches ADD FOREIGN KEY(task_id) REFERENCES video_tasks(task_id);
ALTER TABLE Medications ADD CONSTRAINT FK_Medications_User FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE MedicationHistory ADD CONSTRAINT FK_MedicationHistory_Medication FOREIGN KEY (medication_id) REFERENCES Medications(medication_id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE UserFriends ADD FOREIGN KEY (user_id) REFERENCES Users(user_id);
ALTER TABLE UserFriends ADD FOREIGN KEY (friend_id) REFERENCES Users(user_id);
ALTER TABLE event_signup ADD FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE event_signup ADD FOREIGN KEY (event_id) REFERENCES Event(event_id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE Groups ADD CONSTRAINT FK_Groups_Users FOREIGN KEY (owner_id) REFERENCES Users(user_id) ON DELETE NO ACTION;
ALTER TABLE GroupMembers ADD CONSTRAINT FK_GroupMembers_Groups FOREIGN KEY (group_id) REFERENCES Groups(group_id) ON DELETE CASCADE;
ALTER TABLE GroupMembers ADD CONSTRAINT FK_GroupMembers_Users FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE;
ALTER TABLE GroupAnnouncements ADD CONSTRAINT FK_GroupAnnouncements_Groups FOREIGN KEY (group_id) REFERENCES Groups(group_id) ON DELETE CASCADE;
ALTER TABLE GroupAnnouncements ADD CONSTRAINT FK_GroupAnnouncements_Users FOREIGN KEY (author_id) REFERENCES Users(user_id) ON DELETE NO ACTION;
ALTER TABLE MailBox ADD FOREIGN KEY (user_id) REFERENCES Users(user_id);
ALTER TABLE PrivateChats ADD FOREIGN KEY (sender_id) REFERENCES Users(user_id);
ALTER TABLE PrivateChats ADD FOREIGN KEY (receiver_id) REFERENCES Users(user_id);
ALTER TABLE GroupChats ADD FOREIGN KEY (group_id) REFERENCES Groups(group_id);
ALTER TABLE GroupChats ADD FOREIGN KEY (sender_id) REFERENCES Users(user_id);
ALTER TABLE daily_calorie_intake ADD FOREIGN KEY(food_id) REFERENCES food_items(food_id);
ALTER TABLE daily_calorie_intake ADD FOREIGN KEY(user_id) REFERENCES Users(user_id);

-- Test data:
-- a) sample vouchers
INSERT INTO vouchers (title, description, cost_points) VALUES
  ('Fairprice voucher 15$', 'Use at supporting establishments', 1500),
  ('Fairprice voucher 20$', 'Use at supporting establishments', 2000);

-- b) sample video-tasks with updated YouTube IDs
INSERT INTO video_tasks (title, description, youtube_id, point_value, category) VALUES
  ('Healthy Habits Intro', 'Learn quick healthy habits.', 'QC8iQqtG0hg', 50, 'Daily Learning'),
  ('Active Aging Tips', 'Stay active as you age.', 'NCvEggpKA9E', 75, 'Daily Exercise'),
  ('Mindful Breathing', 'Short mindfulness exercise.', 'z-3n5iBi4u0', 100, 'Daily Mindfulness');

-- c) food_items sample data
SET IDENTITY_INSERT [dbo].[food_items] ON;
INSERT [dbo].[food_items] ([food_id], [food_name], [calories_per_unit]) VALUES (1, N'Char Kway Teow', 412);
INSERT [dbo].[food_items] ([food_id], [food_name], [calories_per_unit]) VALUES (2, N'Chicken Rice', 500);
INSERT [dbo].[food_items] ([food_id], [food_name], [calories_per_unit]) VALUES (3, N'Fish Soup', 280);
INSERT [dbo].[food_items] ([food_id], [food_name], [calories_per_unit]) VALUES (4, N'Char Kway Teow', 412);
SET IDENTITY_INSERT [dbo].[food_items] OFF;

-- d) recommended_calories sample data
INSERT [dbo].[recommended_calories] ([age_min], [age_max], [recommended_calories]) VALUES (70, 79, 1600);
INSERT [dbo].[recommended_calories] ([age_min], [age_max], [recommended_calories]) VALUES (60, 69, 2000);

/******************************************************************************
* 5. (Admin table, permissions etc. -- LEAVE IN COMMENTS)
******************************************************************************/
--USE bed_AssignmentTestingDB
--INSERT INTO Users (username, email, passwordHash, role)
--VALUES (
--    'testadmin', -- Choose a username for your admin
--    'admin@example.com', -- Admin's email
--    '<PASTE_YOUR_GENERATED_HASH_HERE>', -- PASTE THE HASHED PASSWORD YOU COPIED
--    'admin' -- Explicitly set the role to 'admin'
--);
--GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.Users TO booksapi_user;
--GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.Profiles TO booksapi_user;
--GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.RevokedTokens TO booksapi_user;
