-- Migration: Seed initial data
-- Date: 2025-01-20

-- Insert fish species
INSERT INTO species (name, scientific_name, description) VALUES
  ('Musky', 'Esox masquinongy', 'The muskellunge, often called musky, is a large freshwater fish'),
  ('Pike', 'Esox lucius', 'Northern pike is a predatory fish found in freshwater'),
  ('Bass(Smallmouth)', 'Micropterus dolomieu', 'Smallmouth bass is a popular game fish'),
  ('Bass(Largemouth)', 'Micropterus salmoides', 'Largemouth bass is one of the most sought-after game fish'),
  ('Walleye', 'Sander vitreus', 'Walleye is a freshwater perciform fish'),
  ('Perch', 'Perca flavescens', 'Yellow perch is a popular panfish'),
  ('Bluegill', 'Lepomis macrochirus', 'Bluegill is a species of freshwater sunfish'),
  ('Catfish', 'Ictalurus punctatus', 'Channel catfish is North America''s most numerous catfish species'),
  ('Trout', 'Salmo trutta', 'Brown trout is a European species of salmonid fish'),
  ('Salmon', 'Salmo salar', 'Atlantic salmon is a species of ray-finned fish'),
  ('Crappie', 'Pomoxis', 'Crappies are popular panfish')
ON CONFLICT (name) DO NOTHING;

-- Insert lure types
INSERT INTO lures (name, type, description) VALUES
  ('Bucktail', 'Spinner', 'Large inline spinner with hair or synthetic tail'),
  ('Spoon', 'Metal', 'Curved metal lure that wobbles when retrieved'),
  ('Topwater', 'Surface', 'Lure designed to float and create surface disturbance'),
  ('Crankbait', 'Diving', 'Hard-bodied lure with lip that dives when retrieved'),
  ('Spinnerbait', 'Wire', 'Wire-framed lure with spinning blades'),
  ('Jig', 'Weighted', 'Weighted head with hook and soft body or skirt'),
  ('Swimbait', 'Soft', 'Soft plastic lure that mimics swimming fish'),
  ('Soft Plastic', 'Soft', 'Various soft plastic worms, grubs, and creatures'),
  ('Drop Shot', 'Finesse', 'Finesse technique with weight below hook'),
  ('Rapala', 'Minnow', 'Classic floating/diving minnow lure'),
  ('Rattle Trap', 'Lipless', 'Lipless crankbait with internal rattles'),
  ('Live Bait', 'Natural', 'Natural bait like minnows, worms, or leeches'),
  ('Fly', 'Fly Fishing', 'Artificial fly for fly fishing')
ON CONFLICT (name) DO NOTHING;

-- Insert sample catches for testing (with various Minnesota locations)
INSERT INTO catches (user_id, species, weight, length, location, latitude, longitude, date, notes) VALUES
  ('test-user-123', 'Bass(Largemouth)', 4.5, 18.5, 'Lake Minnetonka, MN', 44.9133, -93.5030, '2024-06-15 08:30:00', 'Great morning catch near the lily pads. Used topwater lure at 5.5ft depth'),
  ('test-user-123', 'Walleye', 3.2, 17.0, 'Mille Lacs Lake, MN', 46.2441, -93.6267, '2024-07-20 19:45:00', 'Evening bite was on fire. Jig at 12ft, water temp 68.5°F'),
  ('test-user-123', 'Pike', 8.5, 32.0, 'Leech Lake, MN', 47.1500, -94.3833, '2024-08-10 11:00:00', 'Monster pike on a spoon at 8ft depth'),
  ('test-user-123', 'Musky', 15.0, 42.0, 'Lake Vermilion, MN', 47.8333, -92.3500, '2024-09-05 16:30:00', 'Personal best musky! Bucktail in 15ft of water'),
  ('test-user-123', 'Bass(Smallmouth)', 2.8, 14.5, 'Lake Superior, Duluth', 46.8297, -92.0102, '2024-05-25 07:15:00', 'Rocky point produced. Drop shot rig at 18ft'),
  ('test-user-123', 'Crappie', 1.2, 11.0, 'Lake Minnewaska, MN', 45.5844, -95.3889, '2024-04-12 14:00:00', 'Spring crappies in the shallows, 4ft depth'),
  ('test-user-123', 'Bluegill', 0.8, 8.5, 'White Bear Lake, MN', 45.0847, -92.9750, '2024-07-04 10:30:00', 'Kids first fish! Live bait at 6ft'),
  ('test-user-123', 'Catfish', 12.0, 28.0, 'Mississippi River, Red Wing', 44.5667, -92.5333, '2024-08-22 21:00:00', 'Night fishing success with live bait at 20ft');