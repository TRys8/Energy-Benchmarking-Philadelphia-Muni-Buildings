library(stringr)
library(tidyr)
library(dplyr)

setwd("~/Dropbox/Energy-Benchmarking-Philadelphia-Muni-Buildings/data")

energy_df <- read.csv("../data/2011-13 Philadelphia Municipal Building Energy Usage.csv", stringsAsFactors=F)

energy_df <- rename(energy_df, weui = Weather.Normalized.Source.EUI..kBtu.ft2.)

weui_df <- energy_df[, c("Property.Id", "weui", "Year")]

weui_df_wide <- weui_df %>% spread(Year, weui)

names(weui_df_wide) <- c("Property.Id", paste0("weui", 2011:2013))

weui_df_wide$perc_1213 <- ((weui_df_wide$weui2013 - weui_df_wide$weui2012) / weui_df_wide$weui2012) * 100
weui_df_wide$raw_1213 <- weui_df_wide$weui2013 - weui_df_wide$weui2012

loc_df <- energy_df[, c("Property.Id", "Property.Name", "Location")]

loc_df <- loc_df[!duplicated(loc_df$Property.Id),]

loc_df$coords <- str_sub(loc_df$Location, start=sapply(loc_df$Location, FUN=function(x){str_locate(x, pattern=fixed("("))[1]}))

loc_df$lat <- str_sub(loc_df$coords, 
                      start=sapply(loc_df$coords, FUN=function(x){str_locate(x, pattern=fixed("("))[1] + 1}),
                      end=sapply(loc_df$coords, FUN=function(x){str_locate(x, pattern=fixed(","))[1]} - 1)
                      )

loc_df$lon <- str_sub(loc_df$coords, 
                      start=sapply(loc_df$coords, FUN=function(x){str_locate(x, pattern=fixed(","))[1] + 2}),
                      end=sapply(loc_df$coords, FUN=function(x){str_locate(x, pattern=fixed(")"))[1]} - 1)
                      )

loc_df$Location <- NULL
loc_df$coords <- NULL

muni_energy_df <- merge(loc_df, weui_df_wide, by="Property.Id")

names(muni_energy_df) <- c("property_id", "property_name", "lat", "lon", "weui2011", "weui2012", "weui2013", "perc_1213", "raw_1213")

write.table(muni_energy_df, "muni_energy.csv", sep=",", row.names=F)
