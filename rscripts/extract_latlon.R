# Purpose: Create small, cleaned .csv containing location 
#          and energy use data, one row per building, from 
#          "2011-13 Philadelphia Municipal Building Energy Usage.csv"

# load packages for string and data manipulation 
library(stringr)
library(tidyr)
library(dplyr)

# setwd("~/Dropbox/Energy-Benchmarking-Philadelphia-Muni-Buildings/data") # update to current working directory

# read data
energy_df <- read.csv("../data/2011-13 Philadelphia Municipal Building Energy Usage.csv", stringsAsFactors=F)

# rename long variable name to 'weui'
energy_df <- rename(energy_df, weui = Weather.Normalized.Source.EUI..kBtu.ft2.)

# create small subset of data with only property id, weui, and year
weui_df <- energy_df[, c("Property.Id", "weui", "Year")]

# transform data from long (multiple rows per building, one for each year)
# to wide format (one row per building, multiple columns for years)
weui_df_wide <- weui_df %>% spread(Year, weui)

# rename variables in wide form data
names(weui_df_wide) <- c("Property.Id", paste0("weui", 2011:2013))

# create additional variables 
weui_df_wide$perc_1213 <- ((weui_df_wide$weui2013 - weui_df_wide$weui2012) / weui_df_wide$weui2012) * 100 # percent change from 2012 to 2013
weui_df_wide$raw_1213 <- weui_df_wide$weui2013 - weui_df_wide$weui2012 # simple raw change from 2012 to 2013
weui_df_wide$avg_1113 <- apply(weui_df_wide[, c("weui2011", "weui2012", "weui2013")], 1, FUN=mean, na.rm=T) # mean energy use 2011-2013

# create small subset of data with only property id, name, address, and location
loc_df <- energy_df[, c("Property.Id", "Property.Name", "Address.1", "Location")]

# remove duplicated rows, so only one row per building remains
loc_df <- loc_df[!duplicated(loc_df$Property.Id),]

# extract coordinate string from location variable
loc_df$coords <- str_sub(loc_df$Location, start=sapply(loc_df$Location, FUN=function(x){str_locate(x, pattern=fixed("("))[1]}))

# extract latitude position from coordinate string
loc_df$lat <- str_sub(loc_df$coords, 
                      start=sapply(loc_df$coords, FUN=function(x){str_locate(x, pattern=fixed("("))[1] + 1}),
                      end=sapply(loc_df$coords, FUN=function(x){str_locate(x, pattern=fixed(","))[1]} - 1)
                      )

# extract longitude position from coordinate string
loc_df$lon <- str_sub(loc_df$coords, 
                      start=sapply(loc_df$coords, FUN=function(x){str_locate(x, pattern=fixed(","))[1] + 2}),
                      end=sapply(loc_df$coords, FUN=function(x){str_locate(x, pattern=fixed(")"))[1]} - 1)
                      )

# remove old location and coordinate strings
loc_df$Location <- NULL
loc_df$coords <- NULL

# merge loc_df (cleaned location data) with weui_df_wide (energy use data)
muni_energy_df <- merge(loc_df, weui_df_wide, by="Property.Id")

# rename all variables with snake_case
names(muni_energy_df) <- c("property_id", "property_name", "address", "lat", "lon", "weui2011", "weui2012", "weui2013", "perc_1213", "raw_1213", "avg_1113")

# write merged dataframe to file
write.table(muni_energy_df, "muni_energy.csv", sep=",", row.names=F)
