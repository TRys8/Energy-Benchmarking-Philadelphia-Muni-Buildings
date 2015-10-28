library(stringr)
#setwd("~/Dropbox/Energy-Benchmarking-Philadelphia-Muni-Buildings/data")

energy_df <- read.csv("../2011-13 Philadelphia Municipal Building Energy Usage.csv", stringsAsFactors=F)

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

write.table(loc_df, "muni_locations.csv", sep=",", row.names=F)
