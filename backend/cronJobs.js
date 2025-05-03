const cron = require('node-cron');
const User = require('./models/User');
const Notification = require('./models/Notification');
const Card = require('./models/Card');
const UserAsset = require('./models/UserAsset');

// Leaderboard Reward - Midnight
cron.schedule('0 0 * * *', async () => {
  console.log('Running daily top user bonus cron job...');
  try {
    const topUsers = await User.find({ role: { $ne: 'admin' } }).sort({ coins: -1 }).limit(3);
    const bonus = [500, 400, 300];

    for (let i = 0; i < topUsers.length; i++) {
      topUsers[i].coins += bonus[i];
      await topUsers[i].save();
      await Notification.create({
        userId: topUsers[i]._id,
        message: `Congrats! You earned ${bonus[i]} coins for rank ${i + 1} on the leaderboard!`,
      });
      console.log(`Gave ${bonus[i]} coins to ${topUsers[i].username}`);
    }
  } catch (err) {
    console.error('Leaderboard bonus error:', err);
  }
});

// Holding Reward
cron.schedule('0 0 * * *', async () => {
  try {
    // Find users who are eligible for a coin award
    const users = await User.find();

    for (const user of users) {
      // Check if the user holds a "Sedan" or "SUV" card and if they haven't already received coins today
      const userAssets = await UserAsset.find({ userId: user._id }).populate('cardId');
      
      let eligibleForReward = false;

      userAssets.forEach(asset => {
        if (asset.cardId.name.includes('Sedan') || asset.cardId.name.includes('SUV')) {
          eligibleForReward = true;
        }
      });

      // If eligible for reward and no coins have been awarded today
      if (eligibleForReward && (!user.lastCoinAwardDate || new Date(user.lastCoinAwardDate).getDate() !== new Date().getDate())) {
        user.coins += 50;  // Add 50 coins
        user.lastCoinAwardDate = new Date();  // Update last reward date
        await user.save();
      }
    }

    console.log('Daily coin award task completed');
  } catch (err) {
    console.error('Error during coin award task:', err);
  }
});

// Schedule the cron job to run daily for more than 10 assets
cron.schedule('0 0 * * *', async () => {
  try {
    // Get all users from the database
    const users = await User.find();

    // Loop through all users to check their assets
    for (const user of users) {
      // Get the number of assets the user has
      const userAssets = await UserAsset.find({ userId: user._id });

      if (userAssets.length > 10) {
        // If the user has more than 10 assets, give them 50 coins
        user.coins += 50;

        // Save the updated user data
        await user.save();

        console.log(`User ${user.username} has more than 10 assets. 50 coins added.`);
      }
    }
  } catch (err) {
    console.error('Error while processing cron job for giving coins based on assets:', err);
  }
});

// The list of car types that qualify for the coin rewards
const carTypes = ['coupe', 'custom', 'classic', 'roadster'];

// Schedule the cron job to run daily at midnight
cron.schedule('* * * * *', async () => {
  try {
    // Get all users from the database
    const users = await User.find();

    // Loop through all users to check their assets
    for (const user of users) {
      // Fetch the user's assets
      const userAssets = await UserAsset.find({ userId: user._id }).populate('cardId');

      // Count how many of the specified car types the user owns
      const ownedCars = userAssets.filter((userAsset) => {
        const cardName = userAsset.cardId.name.toLowerCase();
        return carTypes.some((carType) => cardName.includes(carType.toLowerCase()));
      });

      // Calculate the coins based on the number of cars the user owns
      let coinsToAdd = 0;
      switch (ownedCars.length) {
        case 1:
          coinsToAdd = 30;
          break;
        case 2:
          coinsToAdd = 60;
          break;
        case 3:
          coinsToAdd = 90;
          break;
        case 4:
          coinsToAdd = 120;
          break;
        default:
          coinsToAdd = 0; // No reward if they own 0 of these cars
      }

      // If the user owns one or more of these cars, add the respective coins
      if (coinsToAdd > 0) {
        user.coins += coinsToAdd;
        await user.save(); // Save the updated user data
        console.log(`User ${user.username} received ${coinsToAdd} coins for owning ${ownedCars.length} of the specified car types.`);
      }
    }
  } catch (err) {
    console.error('Error while processing cron job for car-based coin rewards:', err);
  }
});


cron.schedule('*/2 * * * *', async () => {
  console.log('Running dynamic pricing update...');

  try {
    const users = await User.find({ role: { $ne: 'admin' } }).exec();
    const totalUsers = users.length || 1; // Prevent division by 0
    
    const cards = await Card.find().exec();
    const assets = await UserAsset.find().populate('cardId').exec(); // Populate cardId to avoid additional queries

    const basePrices = {
      'Hatchback L1': 450, 'SUV L1': 600, 'Sedan L1': 700, 'Wagon L1': 800,
      'EV L1': 900, 'SUV L2': 950, 'Sedan L2': 1100, 'Convertible L1': 1250,
      'Minivan L1': 1350, 'Classic L1': 1500, 'Roadster L1': 1650, 'Custom L1': 1800,
      'Coupe L1': 2000, 'Ship L1': 2200, 'Yacht L1': 2500,
    };

    const maxCards = {
      'Hatchback L1': 10, 'SUV L1': 11, 'Sedan L1': 15, 'Wagon L1': 13,
      'EV L1': 10, 'SUV L2': 17, 'Sedan L2': 14, 'Convertible L1': 8,
      'Minivan L1': 10, 'Classic L1': 5, 'Roadster L1': 12, 'Custom L1': 10,
      'Coupe L1': 7, 'Ship L1': 5, 'Yacht L1': 3,
    };

    const cardMap = {};
    cards.forEach(card => cardMap[card.name] = card);

    const ownershipMap = {};
    assets.forEach(asset => {
      const cardId = asset.cardId._id.toString();
      ownershipMap[cardId] = (ownershipMap[cardId] || 0) + 1;
    });

    for (const card of cards) {
      const cardName = card.name;
      const basePrice = basePrices[cardName];
      const maxCount = maxCards[cardName];
      const ownedCount = ownershipMap[card._id.toString()] || 0;

      // % of users who own this card
      const userOwnershipRate = ownedCount / totalUsers;

      // Rarity factor — rarer cards are more sensitive
      const rarityFactor = 1 + (1 - maxCount / 20); // 1 to ~1.5

      // Pricing logic: normalize demand influence
      let multiplier = 1;
      if (userOwnershipRate > 0.4) {
        multiplier = 1 + (userOwnershipRate * 0.02 * rarityFactor); // Uptrend
        card.description = `📈 ${cardName} is trending upwards. High user interest!`;
      } else if (userOwnershipRate < 0.15) {
        multiplier = 1 - (0.015 * rarityFactor); // Downtrend
        card.description = `📉 ${cardName} is losing popularity. Price may fall more.`;
      } else {
        multiplier = 1; // Stable
        card.description = `⚖️ ${cardName} price stable. Watching the market...`;
      }

      // Smart Inter-card logic: Adjust SUV ↔ Sedan prices
      if (cardName.includes('SUV') && cardMap['Sedan L1']) {
        multiplier *= 1.01;
        card.description = `🚗 SUVs rising due to Sedan dip!`;
      } else if (cardName.includes('Sedan') && cardMap['SUV L1']) {
        multiplier *= 0.99;
        card.description = `🚘 Sedans slowing as SUV popularity grows.`;
      }
      
      // Luxury vs Economy: As luxury cars increase in price, users might opt for more economical alternatives
      if (cardName.includes('Coupe') && cardMap['Wagon L1']) {
        multiplier *= 0.98; // Economy cars' price decreases as luxury cars rise
        card.description = `💎 Luxury car prices rise, leading to increased demand for economy options!`;
      } else if (cardName.includes('Wagon') && cardMap['Coupe L1']) {
        multiplier *= 1.02; // Economy cars become more attractive as luxury prices rise
        card.description = `💸 Economy cars are gaining popularity as luxury prices climb!`;
      }

      // Electric Cars (EV) vs Traditional Cars: EVs rising while traditional cars drop
      if (cardName.includes('EV') && (cardMap['SUV L2'] || cardMap['Sedan L2'])) {
        multiplier *= 1.05; // EV prices rise due to increasing demand
        card.description = `⚡ Electric Vehicles are trending upwards as traditional cars see a slight decline.`;
      } else if ((cardName.includes('SUV L2') || cardName.includes('Sedan L2')) && cardMap['EV L1']) {
        multiplier *= 0.95; // Traditional cars dip as EV popularity increases
        card.description = `🚙 Traditional cars slowing down, while EVs rise in popularity.`;
      }

      // Customs vs Minivan: Minivan demand decreases as Customs become more fashionable
      if (cardName.includes('Custom') && cardMap['Minivan L1']) {
        multiplier *= 1.03; // Customs become more desirable for fashion, increasing their price
        card.description = `🏞️ Customs are growing in popularity for family adventures, pushing prices up.`;
      } else if (cardName.includes('Minivan') && cardMap['Custom L1']) {
        multiplier *= 0.97; // Minivans' demand drops as Customs dominate
        card.description = `🚗 Minivans losing popularity as SUVs rise in family preferences.`;
      }

      // Seasonal Trends: Convertibles in demand during summer months
      const currentMonth = new Date().getMonth();
      if (cardName.includes('Convertible L1') && (currentMonth >= 5 && currentMonth <= 8)) {
        multiplier *= 1.1; // 10% increase in price during summer months
        card.description = `🌞 It's summer! Convertibles are in high demand.`;
      } else if (cardName.includes('Convertible L1') && (currentMonth >= 9 && currentMonth <= 4)) {
        multiplier *= 0.9; // 10% decrease in price during winter months
        card.description = `❄️ Convertible prices are dipping as the colder months arrive.`;
      }

      // Classic vs Roadster: Classic cars appreciate while Roadster cars remain stable
      if (cardName.includes('Classic') && cardMap['Roadster L1']) {
        multiplier *= 1.05; // Classic cars appreciate in value, pushing prices up
        card.description = `⏳ Classic cars are becoming more sought after! Prices are increasing.`;
      } else if (cardName.includes('Roadster') && cardMap['Classic L1']) {
        multiplier *= 0.98; // Roadster cars have a slight decrease as classic cars rise
        card.description = `🚗 Roadster cars are seeing a minor dip as classic car prices surge.`;
      }

      // Ship vs Yacht: As yachts become more popular, commercial ship demand slightly dips
      if (cardName.includes('Ship') && cardMap['Yacht L1']) {
        multiplier *= 0.96; // Commercial ships dip slightly as luxury yachts dominate
        card.description = `⛵ Yachts are stealing the spotlight! Commercial ship interest is slightly dipping.`;
      } else if (cardName.includes('Yacht') && cardMap['Ship L1']) {
        multiplier *= 1.04; // Yachts' price increases with luxury market momentum
        card.description = `🚢 As commercial ships slow down, yachts are cruising ahead in demand!`;
      }

      // Inertia: limit changes to ±3%
      multiplier = Math.min(1.03, Math.max(0.97, multiplier));

      // Apply a floor (80% of base price) and ceiling (1.2x of base price)
      const newPrice = Math.max(basePrice * 0.8, Math.min(basePrice * 1.2, parseFloat((card.coins * multiplier).toFixed(2))));

      // Update card price
      card.coins = newPrice;

      // Ensure price doesn't exceed maxCards
      const finalPrice = Math.min(newPrice, basePrice * maxCount / totalUsers);
      card.coins = finalPrice;

      // Save card price
      await card.save();
    }

    console.log('Dynamic prices updated with demand balance & rarity factor.');
  } catch (err) {
    console.error('Dynamic pricing error:', err);
  }
});
